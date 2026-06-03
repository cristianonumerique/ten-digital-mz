const nodemailer = require('nodemailer');

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Templates de email
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Bem-vindo ao Ten Digital MZ! 🎮',
    html: `
      <h2>Olá ${name}!</h2>
      <p>Bem-vindo ao Ten Digital MZ!</p>
      <p>Agora você pode comprar recargas, gift cards e acesso a streaming com segurança.</p>
      <a href="${process.env.FRONTEND_URL}">Começar a Comprar</a>
    `
  }),
  purchaseConfirmation: (data) => ({
    subject: `✅ Seu ${data.product} está pronto para usar!`,
    html: `
      <h2>Olá ${data.name}!</h2>
      <p>Seu pedido <strong>${data.purchaseId}</strong> foi confirmado!</p>
      <p><strong>Produto:</strong> ${data.product}</p>
      <p><strong>Seu Código de Resgate:</strong></p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.code}</p>
      <p>Use este código para resgatar seu produto na plataforma.</p>
      <p>Obrigado por comprar conosco!</p>
    `
  }),
  codeRedeemed: (data) => ({
    subject: `✨ Código ${data.product} resgatado com sucesso!`,
    html: `
      <h2>Olá ${data.name}!</h2>
      <p>Seu código foi resgatado com sucesso!</p>
      <p><strong>Produto:</strong> ${data.product}</p>
      <p><strong>Código:</strong> ${data.code}</p>
      <p>Aproveite seu produto!</p>
    `
  })
};

// Função para enviar email
const sendEmail = async (options) => {
  try {
    const { to, subject, template, data } = options;

    let mailOptions = { to, subject };
    
    if (template === 'welcome') {
      const tmpl = emailTemplates.welcome(data.name);
      mailOptions.subject = tmpl.subject;
      mailOptions.html = tmpl.html;
    } else if (template === 'purchase-confirmation') {
      const tmpl = emailTemplates.purchaseConfirmation(data);
      mailOptions.subject = tmpl.subject;
      mailOptions.html = tmpl.html;
    } else if (template === 'code-redeemed') {
      const tmpl = emailTemplates.codeRedeemed(data);
      mailOptions.subject = tmpl.subject;
      mailOptions.html = tmpl.html;
    } else {
      mailOptions.text = subject;
    }

    const result = await transporter.sendMail({
      from: `Ten Digital MZ <${process.env.EMAIL_USER}>`,
      ...mailOptions
    });

    console.log(`✅ Email enviado para ${to}`);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
};

module.exports = { sendEmail, emailTemplates };
