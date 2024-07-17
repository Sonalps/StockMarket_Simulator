import datetime
from decimal import Decimal
import re
from flask import Flask, Response, flash, json, jsonify, render_template, request, redirect, stream_with_context, url_for,flash
import mysql.connector
import requests

app = Flask(__name__)

api_key = 'X9AJE0CM7WK61O8S'

def get_db_connection():
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='Sonal123$', 
        database='stock_simulator'
    )
    return conn

trades = []

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if email and password:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", (email, password))
            user = cursor.fetchone()
            cursor.close()
            conn.close()

            if user:
                return redirect(url_for('index'))
            else:
                return "Invalid credentials", 401  # or render a template with an error message

        return "Missing email or password", 400  # Bad Request

    return render_template('login.html')

@app.route('/index')
def index():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM trades')
    trades = cursor.fetchall()
    cursor.close()
    connection.close()
    
    account_value, todays_change, annual_return, buying_power, cash = calculate_portfolio(trades)
    
    return render_template('index.html', trades=trades, account_value=account_value, todays_change=todays_change, annual_return=annual_return, buying_power=buying_power, cash=cash)

def calculate_portfolio(trades):
    initial_cash = Decimal('100000.00')  # Use Decimal for consistency
    cash = initial_cash
    portfolio_value = Decimal('0.0')
    positions = {}

    # Calculate the value of current positions
    for trade in trades:
        symbol = trade['symbol']
        action = trade['action']
        quantity = Decimal(str(trade['quantity']))  # Convert to Decimal
        price = Decimal(str(trade['price']))  # Convert to Decimal
        
        if symbol not in positions:
            positions[symbol] = {'quantity': Decimal('0'), 'total_cost': Decimal('0.0')}

        if action == 'buy':
            positions[symbol]['quantity'] += quantity
            positions[symbol]['total_cost'] += quantity * price
            cash -= quantity * price
        elif action == 'sell':
            positions[symbol]['quantity'] -= quantity
            positions[symbol]['total_cost'] -= quantity * price
            cash += quantity * price

    # Fetch current prices for each stock in the portfolio
    for symbol in positions:
        current_price = fetch_stock_price(symbol)
        if current_price is not None:
            portfolio_value += positions[symbol]['quantity'] * Decimal(str(current_price))

    account_value = cash + portfolio_value
    todays_change = Decimal('0.0')  # You need to calculate this based on today's trades
    annual_return = ((account_value - initial_cash) / initial_cash) * Decimal('100')
    buying_power = cash

    return account_value, todays_change, annual_return, buying_power, cash

def fetch_stock_price(symbol):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=1min&apikey=YOUR_API_KEY'
    response = requests.get(url)
    data = response.json()
    if 'Time Series (1min)' in data:
        latest_time = list(data['Time Series (1min)'])[0]
        return float(data['Time Series (1min)'][latest_time]['4. close'])
    return None

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/portfolio')
def portfolio():
    return render_template('portfolio.html')

@app.route('/learn')
def learn():
    return render_template('learn.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/news')
def news():
    return render_template('news.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        mobile = request.form['mobile']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (name, email, password, mobile) VALUES (%s, %s, %s, %s)', (name, email, password, mobile))
        conn.commit()
        cursor.close()
        conn.close()
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/trade', methods=['GET', 'POST'])
def trade():
    if request.method == 'POST':
        symbol = request.form['symbol']
        action = request.form['action']
        quantity = request.form['quantity']
        price = request.form['price']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO trades (symbol, action, quantity, price) VALUES (%s, %s, %s, %s)',
                       (symbol, action, quantity, price))
        conn.commit()
        cursor.close()
        conn.close()

        return redirect(url_for('index'))
    return render_template('trade.html')

@app.route('/trades', methods=['GET'])
def trades():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM trades ORDER BY timestamp DESC')
    trades = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(trades)

@app.route('/delete_trade/<int:trade_id>', methods=['POST'])
def delete_trade(trade_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM trades WHERE id = %s', (trade_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True)

   