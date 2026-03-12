import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { bodyImage, modelImage } = await req.json();

    if (!bodyImage || !modelImage) {
      return new Response(
        JSON.stringify({ error: 'Body image and model image are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Starting outfit transfer process...');

    const prompt = `OUTFIT TRANSFER - STRICT ACCURACY REQUIRED

YOU MUST FOLLOW THESE RULES EXACTLY:

1. TASK: Transfer the ENTIRE OUTFIT from the MODEL PHOTO onto the TARGET PERSON photo.

2. IDENTITY PRESERVATION (CRITICAL):
   - Keep the EXACT same face, hair color, hairstyle, skin tone, body shape from the TARGET PERSON photo
   - Keep the EXACT same pose and background from the TARGET PERSON photo
   - The result must look like the TARGET PERSON, NOT the model

3. OUTFIT TRANSFER (CRITICAL):
   - Copy ALL clothing items from the MODEL PHOTO: top, bottom, shoes, accessories, layers, everything visible
   - Preserve the EXACT colors, patterns, textures, and designs of each clothing item from the MODEL PHOTO
   - Maintain the outfit styling: how items are layered, tucked, rolled, etc.

4. REALISM:
   - Natural fabric draping matching the TARGET PERSON's body shape and pose
   - Proper shadows and lighting matching the TARGET PERSON's photo
   - Seamless integration - should look like a real photo of the TARGET PERSON wearing the model's outfit

OUTPUT: Generate ONE photorealistic image of the TARGET PERSON wearing the MODEL's complete outfit.`;

    const contentArray = [
      { type: "text", text: prompt },
      { type: "text", text: "=== MODEL PHOTO (copy the outfit FROM this person) ===" },
      { type: "image_url", image_url: { url: modelImage } },
      { type: "text", text: "=== TARGET PERSON (apply the outfit TO this person, keep their face/body/pose) ===" },
      { type: "image_url", image_url: { url: bodyImage } },
    ];

    const models = [
      "google/gemini-3-pro-image-preview",
      "google/gemini-2.5-flash-image-preview",
    ];

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      console.log(`Attempt ${i + 1}/${models.length} with model: ${model}`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: contentArray }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);

        if (response.status === 429) {
          return new Response(
            JSON.stringify({ success: false, code: 429, error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ success: false, code: 402, error: 'Hết hạn mức sử dụng AI, vui lòng nạp thêm credits.' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (i < models.length - 1) continue;

        return new Response(
          JSON.stringify({ success: false, error: `AI Gateway error: ${response.status}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        if (i < models.length - 1) continue;
        return new Response(
          JSON.stringify({ success: false, error: 'AI trả về kết quả rỗng. Vui lòng thử lại.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        if (i < models.length - 1) continue;
        return new Response(
          JSON.stringify({ success: false, error: 'Không thể đọc kết quả từ AI. Vui lòng thử lại.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const message = data.choices?.[0]?.message;
      const generatedImage = message?.images?.[0]?.image_url?.url;

      if (generatedImage) {
        console.log('Outfit transfer completed successfully');
        return new Response(
          JSON.stringify({
            success: true,
            generatedImage,
            message: message?.content || 'Đã chuyển outfit thành công!',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (i < models.length - 1) continue;

      return new Response(
        JSON.stringify({ success: false, error: 'Không thể tạo hình ảnh. Vui lòng thử lại.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Không thể tạo hình ảnh. Vui lòng thử lại.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in outfit-transfer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Đã xảy ra lỗi' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
