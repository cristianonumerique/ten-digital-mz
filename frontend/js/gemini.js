// Integração com Google Gemini AI

async function sendToGemini(message) {
    try {
        // Chamar o backend que vai comunicar com Gemini
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (response.ok) {
            addChatMessage(data.reply, 'bot');
        } else {
            addChatMessage('Desculpe, ocorreu um erro. Tente novamente.', 'bot');
        }
    } catch (error) {
        console.error('Erro ao comunicar com Gemini:', error);
        addChatMessage('❌ Erro de conexão. Tente novamente mais tarde.', 'bot');
    }
}

// Sistema de contexto para IA
const geminiContext = `
Você é um assistente de atendimento ao cliente para a plataforma Ten Digital MZ.
Você ajuda clientes com:
- Dúvidas sobre produtos (recargas, gift cards, streaming)
- Processo de compra e resgate de códigos
- Problemas técnicos
- Informações de conta

Sempre seja cortês, rápido e útil.
Respostas em português de Moçambique.
`;

// Função auxiliar para formatar mensagens
function formatGeminiMessage(text) {
    // Remover markdown se necessário
    return text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}
