import React, { useState } from 'react';
import './App.css';

const API_KEY_SENTIMENT = process.env.REACT_APP_SECRET_KEY
const API_KEY_HIGHLIGHT = process.env.REACT_APP_SECRET_KEY
const API_KEY_EXPAND = process.env.REACT_APP_SECRET_KEY
const API_KEY_CHATGPT =process.env.REACT_APP_SECRET_KEY
const API_KEY_CHATGPT_HASHTAG =process.env.REACT_APP_SECRET_KEY

function App() {
  const [tweet, setTweet] = useState("");
  const [sentiment, setSentiment] = useState("");

  const [highlightedTweet, setHighlightedTweet] = useState("");
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [generatedTweet, setGeneratedTweet] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState("");
  const [translatedTweet, setTranslatedTweet] = useState("");

  const API_RATE_LIMIT_DELAY = 1000;

  async function callOpenAIAPI(apiKey, prompt) {
    console.log(`Calling the OpenAI API with ${apiKey}`);
    const APIBody = {
      "model": "text-davinci-003",
      "prompt": prompt,
      "temperature": 0,
      "max_tokens": 70,
      "top_p": 1.0,
      "frequency_penalty": 0.0,
      "presence_penalty": 0.0
    };

    try {
      const openAIResponse = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify(APIBody)
      });

      const openAIData = await openAIResponse.json();

      console.log("OpenAI Response:", openAIData);

      if (!openAIData.choices || openAIData.choices.length === 0) {
        console.error("Invalid response from OpenAI API:", openAIData);
        return;
      }

      if (apiKey === API_KEY_SENTIMENT) {
        setSentiment(openAIData.choices[0].text.trim());
      } else if (apiKey === API_KEY_HIGHLIGHT) {
        const highlightedWords = openAIData.choices[0].text.split(',').map((word) => word.trim());
        const highlightedTweet = tweet
          .split(/\s+/)
          .map((word, index) => (
            highlightedWords.includes(word.toLowerCase()) ?
              `<span key=${index} class="highlight">${word}</span>` :
              word
          ))
          .join(' ');

        setHighlightedTweet(highlightedTweet);
      } else if (apiKey === API_KEY_EXPAND) {
        const suggestedTopics = openAIData.choices[0].text.trim();
        const topicsArray = suggestedTopics.split(',').map((topic) => topic.trim());
        setExpandedTopics(topicsArray);
      }

      await new Promise(resolve => setTimeout(resolve, API_RATE_LIMIT_DELAY));
    } catch (error) {
      console.error("Error in API call:", error);
    }
  }

  async function callChatGPTAPI(prompt) {
    console.log(`Calling the ChatGPT API`);
    const APIBody = {
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 100,
    };

    try {
      const chatGPTResponse = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY_CHATGPT
        },
        body: JSON.stringify(APIBody)
      });

      const chatGPTData = await chatGPTResponse.json();
      console.log("ChatGPT Response:", chatGPTData);

      if (!chatGPTData.choices || chatGPTData.choices.length === 0) {
        console.error("Invalid response from ChatGPT API:", chatGPTData);
        return;
      }

      setGeneratedTweet(chatGPTData.choices[0].text.trim());
    } catch (error) {
      console.error("Error in ChatGPT API call:", error);
    }
  }

  async function callChatGPTHashtagAPI(prompt) {
    console.log(`Calling the ChatGPT Hashtag API`);
    const APIBody = {
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 30,
    };

    try {
      const chatGPTHashtagResponse = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY_CHATGPT_HASHTAG
        },
        body: JSON.stringify(APIBody)
      });

      const chatGPTHashtagData = await chatGPTHashtagResponse.json();
      console.log("ChatGPT Hashtag Response:", chatGPTHashtagData);

      if (!chatGPTHashtagData.choices || chatGPTHashtagData.choices.length === 0) {
        console.error("Invalid response from ChatGPT Hashtag API:", chatGPTHashtagData);
        return;
      }

      setGeneratedHashtags(chatGPTHashtagData.choices[0].text
        .split(',')
        .map(hashtag => hashtag.trim())
        .filter(hashtag => hashtag !== "")
      );
    } catch (error) {
      console.error("Error in ChatGPT Hashtag API call:", error);
    }
  }

  async function callTranslationAPI(prompt) {
    console.log(`Calling the Translation API`);

    const APIBody = {
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 100,
    };

    try {
      const translationResponse = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY_CHATGPT
        },
        body: JSON.stringify(APIBody)
      });

      const translationData = await translationResponse.json();
      console.log("Translation Response:", translationData);

      if (!translationData.choices || translationData.choices.length === 0) {
        console.error("Invalid response from Translation API:", translationData);
        return;
      }

      setTranslatedTweet(translationData.choices[0].text.trim());
    } catch (error) {
      console.error("Error in Translation API call:", error);
    }
  }

  function clearTweet() {
    setTweet("");
    setSentiment("");
    setHighlightedTweet("");
    setExpandedTopics([]);
    setGeneratedTweet("");
    setGeneratedHashtags([]);
    setTranslatedTweet("");
  }

  return (
    <div className="App">
      <div className='App'>
        <h1 style={{ color: 'black' }}>Tweet Your Sentiment</h1>
      </div>

      <br />

      <div>
        <textarea onChange={(e) => setTweet(e.target.value)} value={tweet} placeholder="Paste your tweet here!" cols={50} rows={10} />
      </div>

      <div>
        <button onClick={() => callOpenAIAPI(API_KEY_SENTIMENT, "What is the sentiment of this tweet? " + tweet)}>Tweet Sentiment</button> <br/>
        <button onClick={() => callOpenAIAPI(API_KEY_HIGHLIGHT, "Highlight words influencing sentiment in this tweet: " + tweet)}>Influential Words</button>
        <button onClick={() => callOpenAIAPI(API_KEY_EXPAND, "Explore topics related to this tweet: " + tweet)}>Expand Subject</button>
        <button onClick={() => callChatGPTAPI("Generate tweet idea based on: " + tweet)}>Generate Tweet Idea</button>
        <button onClick={() => callChatGPTHashtagAPI("Suggest hashtags for: " + tweet)}>Generate Hashtags</button>
        <button onClick={() => callTranslationAPI("Translate to Japanese: " + tweet)}>Translate to Japanese</button><br/>
        <button onClick={clearTweet}>Clear</button>

        {sentiment !== "" ? (
          <div>
            <div className="output-box">
              <h3> {sentiment}</h3>
            </div>

            {highlightedTweet !== "" && (
              <div className="output-box">
                <h3>Highlighted Words:</h3>
                <p dangerouslySetInnerHTML={{ __html: highlightedTweet }} />
              </div>
            )}

            {expandedTopics.length > 0 && (
              <div className="output-box">
                <h3>Expanded Topics:</h3>
                <ul>
                  {expandedTopics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {generatedTweet !== "" && (
              <div className="output-box">
                <h3>Generated Tweet Idea:</h3>
                <p>{generatedTweet}</p>
              </div>
            )}

            {generatedHashtags.length > 0 && (
              <div className="output-box">
                <h3>Generated Hashtags:</h3>
                <ul>
                  {generatedHashtags.map((hashtag, index) => (
                    <li key={index}>#{hashtag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {translatedTweet !== "" && (
          <div className="output-box">
            <h3>Translated Tweet (Japanese):</h3>
            <p>{translatedTweet}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


























