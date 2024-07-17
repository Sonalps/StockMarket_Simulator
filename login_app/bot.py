import json
import openai
import streamlit as st
import yfinance as yf
import requests
import matplotlib.pyplot as plt


openai.api_key = open('API_KEY.txt', 'r').read().strip()  # Ensure API key is read properly


# Define stock analysis functions
def get_stock_price(ticker):
    # Get the latest stock price for the given ticker
    return str(yf.Ticker(ticker).history(period='1y').iloc[-1].Close)


def calculate_SMA(ticker, window):
    # Calculate simple moving average
    data = yf.Ticker(ticker).history(period='1y').Close
    return str(data.rolling(window=window).mean().iloc[-1])


def calculate_EMA(ticker, window):
    # Calculate exponential moving average
    data = yf.Ticker(ticker).history(period='1y').Close
    return str(data.ewm(span=window, adjust=False).mean().iloc[-1])


def plot_stock_price(ticker):
    # Plot stock price over the last year
    data = yf.Ticker(ticker).history(period='1y')
    plt.figure(figsize=(10, 5))
    plt.plot(data.index, data.Close)
    plt.title(f'{ticker} Stock Price Over Last Year')
    plt.xlabel('Date')
    plt.ylabel('Stock Price ($)')
    plt.grid(True)
    plt.savefig('stock.png')
    plt.close()


# Initialize Streamlit session state for messages
if 'messages' not in st.session_state:
    st.session_state['messages'] = []


# Streamlit UI
st.title("Stock Analysis Chatbot Assistant")
user_input = st.text_input('Your input:')


if user_input:
    st.session_state['messages'].append({'role': 'user', 'content': f'{user_input}'})


    # Prepare conversation history
    messages = [{'role': msg['role'], 'content': msg['content']} for msg in st.session_state['messages']]


    try:
        # Get completion from OpenAI
       
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo-0613',  # Adjust model name as needed
            messages=messages,
            max_tokens=100
        )


        response_message = response['choices'][0]['message']['content']


        # Display response
        st.text(response_message)
        st.session_state['messages'].append({'role': 'assistant', 'content': response_message})


    except Exception as e:
        st.error(f"Error: {e}")


# Add a button to access Flask app
if st.button("Access Stock Chatbot"):
    link = "http://localhost:5000/chatbot"  # Adjust URL as needed
    st.markdown(f"[Access Stock Chatbot]({link})")
