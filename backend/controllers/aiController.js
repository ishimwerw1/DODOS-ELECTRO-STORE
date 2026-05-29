import OpenAI from 'openai';
import Product from '../models/Product.js';

/**
 * @desc    Chat with DODOS ELECTRO AI (ChatGPT)
 * @route   POST /api/ai/chat
 * @access  Public
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      console.error('AI Error: OPENAI_API_KEY is missing in .env');
      return res.status(500).json({ message: 'AI configuration error: Missing API Key' });
    }

    // Initialize OpenAI inside the handler to ensure env vars are loaded
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!message) {
      return res.status(400).json({ message: 'Please provide a message' });
    }

    // 1. Fetch summary of top products to save tokens and prevent rate limiting
    const products = await Product.find({ isActive: true })
      .select('name category price stock')
      .limit(20); // Limit to top 20 items for context efficiency
    
    const productSummary = products.map(p => 
      `${p.name} (${p.category}): RWF ${p.price} [${p.stock > 0 ? 'In Stock' : 'Out of Stock'}]`
    ).join('\n');

    // 2. Define System Prompt
    const systemPrompt = `
      You are "DODOS ELECTRO AI", the official expert assistant for "DODOS Electro Store".
      DODOS Electro Store is a premium shop specializing in phone spare parts and professional repair services.
      
      OUR PRODUCTS:
      - Phone screens replacement
      - High-capacity batteries
      - Original chargers & cables
      - Charging ports
      - Phone back doors/covers
      - Professional repair tools
      
      OUR SERVICES:
      - Professional screen replacement
      - Battery replacement
      - Charging port repair
      - Water damage diagnosis
      - Software troubleshooting
      
      YOUR GOALS:
      1. Help customers find the right spare parts for their phone models.
      2. Diagnose common phone problems (e.g., "my screen is black", "phone not charging").
      3. Suggest repair solutions and estimate if they need a professional technician.
      4. Recommend compatible products from our inventory.
      5. Answer questions about price and availability based on the data provided.
      
      INVENTORY DATA (Current):
      ${productSummary}
      
      GUIDELINES:
      - Be professional, polite, and technically knowledgeable.
      - Keep responses concise and focused on phone repair/electronics.
      - If you don't know the answer or a specific part is not in our list, suggest they contact our human support.
      - Always prioritize original parts and professional repair for complex issues.
      - Use "RWF" for currency.
    `;

    // 3. Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // 4. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // The most reliable and cost-effective mini model
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    res.json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error('AI Chat Detailed Error:', error);
    
    let errorMessage = 'DODOS ELECTRO AI is currently resting. Please try again later.';
    if (error.status === 401) {
      errorMessage = 'Invalid OpenAI API Key. Please check your backend .env file.';
    } else if (error.status === 429) {
      errorMessage = 'OpenAI Quota Exceeded: Your API key has no remaining credits or has hit its limit. Please check your billing at platform.openai.com.';
    }

    res.status(500).json({ 
      message: errorMessage,
      error: error.message 
    });
  }
};
