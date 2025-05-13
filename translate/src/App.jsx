import { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css'; 

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      setChatHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const geminiResponse = await result.response;
      const text = await geminiResponse.text();

      const newMessage = {
        question: prompt,
        answer: text,
        timestamp: Date.now(),
      };

      setChatHistory((prev) => [...prev, newMessage]);
      setPrompt('');
    } catch (err) {
      console.error('Ошибка при запросе к Gemini:', err);
      alert('Произошла ошибка. Проверь API-ключ и соединение.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <button
        onClick={() => setDarkMode((prev) => !prev)}
        className="theme-toggle"
      >
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <h1 className="chat-title">Gemini</h1>

      <div className="input-row">
        <input
          type="text"
          placeholder="Введите ваш вопрос..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button onClick={handleSubmit}>Отправить</button>
      </div>

      {loading && <div>Загрузка ответа...</div>}

      <div>
        {chatHistory.map((item, idx) => (
          <div key={idx} className="chat-message">
            <p className="question">Вы: {item.question}</p>
            <p className="answer">Gemini: {item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;