import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LLM_API_KEY = Deno.env.get('LLM_API_KEY') || Deno.env.get('LOVABLE_API_KEY');
const LLM_API_URL = Deno.env.get('LLM_API_URL') || 'https://ai.gateway.lovable.dev/v1/chat/completions';
const LLM_MODEL = Deno.env.get('LLM_MODEL') || 'google/gemini-2.5-flash';

const NUTRITION_SYSTEM_PROMPT = `You are BoomStartAI Nutrition, an intelligent nutrition coach designed to help users eat better, fuel workouts, and reach fitness goals safely and sustainably.

IMPORTANT RULES:
- NO medical diagnosis or prescription supplements
- NO extreme diets or fear-based messaging
- Always sustainable, science-backed advice
- Simple, friendly, motivating language

When generating nutrition plans, use these formulas:
- Protein: 1.8g per kg bodyweight (range 1.6-2.2g)
- Fats: 25% of total calories
- Carbs: Remaining calories after protein and fat
- Bulk: TDEE + 400 calories
- Cut: TDEE - 400 calories
- Maintain: TDEE

RESPONSE FORMAT:
Always respond with valid JSON first, then a short encouraging sentence after.

For daily nutrition plans, use this exact schema:
{
  "type": "daily_nutrition",
  "date": "YYYY-MM-DD",
  "total_calories": number,
  "total_protein": number,
  "total_carbs": number,
  "total_fats": number,
  "meals": [
    {
      "meal_type": "breakfast|lunch|dinner|snack",
      "time": "HH:MM",
      "items": [
        {
          "name": "string",
          "quantity": "string",
          "calories": number,
          "protein_g": number,
          "carbs_g": number,
          "fats_g": number
        }
      ],
      "meal_calories": number,
      "meal_protein": number
    }
  ]
}

For macro targets, use:
{
  "type": "nutrition_targets",
  "goal": "bulk|cut|maintain",
  "calories": number,
  "macros": {
    "protein_g": number,
    "carbs_g": number,
    "fats_g": number
  },
  "calculation_steps": ["string"]
}

For food quality analysis, use:
{
  "type": "food_quality",
  "score": number (0-100),
  "breakdown": {
    "whole_food_ratio": number,
    "fiber_score": number,
    "sugar_control": number,
    "protein_distribution": number
  },
  "improvements": ["string"]
}

For cheat meal handling, use:
{
  "type": "cheat_meal_adjustment",
  "estimated_extra_calories": number,
  "weekly_adjustment": "string",
  "message": "string"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, userData, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LLM_API_KEY) {
      console.error('LLM_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build user context
    let userContext = '';
    if (userData) {
      userContext = `
USER PROFILE:
- Weight: ${userData.weight}kg
- Height: ${userData.height}cm
- Age: ${userData.age}
- Gender: ${userData.gender}
- Goal: ${userData.goal}
- Experience: ${userData.experience}
- Dietary Preference: ${userData.dietary_preference}

Calculate targets based on this profile.
`;
    }

    const allowedRoles = new Set(['user', 'assistant']);
    const safeHistory = Array.isArray(conversationHistory)
      ? conversationHistory
          .slice(-6)
          .filter((msg: any) => msg && allowedRoles.has(msg.role) && typeof msg.content === 'string')
          .map((msg: any) => ({
            role: msg.role,
            content: String(msg.content).slice(0, 2000),
          }))
      : [];

    const messages = [
      { role: 'system', content: NUTRITION_SYSTEM_PROMPT + userContext },
      ...safeHistory,
      { role: 'user', content: String(message).slice(0, 2000) }
    ];

    console.log('Calling Lovable AI for nutrition guidance...');

    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response received successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in nutrition-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
