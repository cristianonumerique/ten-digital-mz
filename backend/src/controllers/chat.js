const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemContext = `
Você é um assistente de atendimento ao cliente para a plataforma Ten Digital MZ.
Você ajuda clientes com:
- Dúvidas sobre produtos (recargas, gift cards, streaming)
- Processo de compra e resgate de códigos
- Problemas técnicos
- Informações de conta

Sempre seja cortês, rápido e útil.
Respostas em português de Moçambique.
Se não souber algo, diga honestamente.
`;

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Mensagem é obrigatória' });
    }

    // Inicializar Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Criar chat com contexto
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    // Enviar mensagem com contexto
    const result = await chat.sendMessage(`${systemContext}\n\nCliente: ${message}`);
    const response = await result.response;
    const reply = response.text();

    res.json({
      reply,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro no chat IA:', error);
    res.status(500).json({ message: 'Erro ao processar mensagem' });
  }
};

// Chat com histórico
exports.chatWithHistory = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Mensagem é obrigatória' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Converter histórico
    const history = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    // Enviar mensagem
    const result = await chat.sendMessage(`${systemContext}\n\n${message}`);
    const response = await result.response;
    const reply = response.text();

    res.json({
      reply,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro no chat IA:', error);
    res.status(500).json({ message: 'Erro ao processar mensagem' });
  }
};
