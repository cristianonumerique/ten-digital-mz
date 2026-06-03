// Integração com Google Gemini AI

async function sendToGemini(message) {
    try {
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
