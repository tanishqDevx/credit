from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import pandas as pd
import sqlite3
import os
from datetime import datetime, timedelta

# Create the database directory if it doesn't exist
os.makedirs("data", exist_ok=True)

# Initialize FastAPI app
app = FastAPI(title="Credit Tracking System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    conn = sqlite3.connect("data/transactions.db")
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create transactions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        sales REAL DEFAULT 0,
        cash REAL DEFAULT 0,
        hdfc REAL DEFAULT 0,
        gpay REAL DEFAULT 0,
        payment REAL DEFAULT 0,
        transaction_type TEXT CHECK(transaction_type IN ('sale', 'repayment', 'expense')),
        outstanding REAL DEFAULT 0,
        related_credit_id INTEGER,
        FOREIGN KEY (related_credit_id) REFERENCES transactions(id)
    )
    ''')

    # Create index on customer_name for faster lookups
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_customer_name ON transactions(customer_name)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_date ON transactions(date)')

    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Process Excel file
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are allowed")

    try:
        # Read Excel file
        df = pd.read_excel(file.file)

        # Rename columns to match our schema
        column_mapping = {
            'Particulars': 'customer_name',
            'SALES': 'sales',
            'CASH': 'cash',
            'kotak/hdfc': 'hdfc',
            'G PAY': 'gpay',
            'PAYMENT': 'payment'
        }
        
        df = df.rename(columns=column_mapping)
        print(df.columns)

        # Extract date from the first row (assuming it's in the format DD-MM-YY)
        date_str = None
        for col in df.columns:
            if isinstance(col, str) and "DATE" in col.upper():
                date_str = col.split()[-1]
                break
        
        if not date_str:
            # Try to get date from first row
            for col in df.columns:
                if isinstance(df.iloc[0, df.columns.get_loc(col)], str):
                    potential_date = df.iloc[0, df.columns.get_loc(col)]
                    if isinstance(potential_date, str) and "-" in potential_date:
                        date_str = potential_date
                        break
        
        # If still no date, use today's date
        if not date_str:
            date_str = datetime.now().strftime("%d-%m-%y")
        
        # Convert date to ISO format (YYYY-MM-DD)
        try:
            date_obj = datetime.strptime(date_str, "%d-%m-%y")
        except ValueError:
            try:
                date_obj = datetime.strptime(date_str, "%d-%m-%Y")
            except ValueError:
                date_obj = datetime.now()
        
        date_iso = date_obj.strftime("%Y-%m-%d")

        # Clean up the dataframe
        # 1. Keep only required columns
        required_cols = ['customer_name', 'sales', 'cash', 'hdfc', 'gpay', 'payment']
        for col in required_cols:
            if col not in df.columns:
                df[col] = 0
        
        df = df[required_cols]

        # 2. Remove rows where all numeric columns are NaN or 0
        df = df.fillna(0)
        df = df[(df['sales'] != 0) | (df['cash'] != 0) | (df['hdfc'] != 0) | (df['gpay'] != 0) | (df['payment'] != 0)]
        
        # 3. Remove rows with empty customer_name
        df = df[df['customer_name'].notna() & (df['customer_name'] != '')]


        # Process each row and insert into database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        rows_processed = 0
        
        for _, row in df.iterrows():
            # Determine transaction type and calculate outstanding
            sales = float(row['sales']) if row['sales'] else 0
            cash = float(row['cash']) if row['cash'] else 0
            hdfc = float(row['hdfc']) if row['hdfc'] else 0
            gpay = float(row['gpay']) if row['gpay'] else 0
            payment = float(row['payment']) if row['payment'] else 0
            
            received = cash + hdfc + gpay
            outstanding = 0
            transaction_type = None
            
            if sales > 0:
                transaction_type = 'sale'
                outstanding = sales - received
            elif received > 0 and sales == 0:
                transaction_type = 'repayment'
            elif payment > 0:
                transaction_type = 'expense'
            else:
                continue
            
            # Insert into database
            print(sales, cash, hdfc, gpay, payment, transaction_type, outstanding)
            cursor.execute('''
            INSERT INTO transactions 
            (date, customer_name, sales, cash, hdfc, gpay, payment, transaction_type, outstanding)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (date_iso, row['customer_name'], sales, cash, hdfc, gpay, payment, transaction_type, outstanding))
            
            rows_processed += 1
        
        conn.commit()
        conn.close()
        
        return {"status": "success", "rows_processed": rows_processed, "date": date_iso}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

# Get all transactions
@app.get("/api/transactions")
async def get_transactions(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    customer_name: Optional[str] = None,
    transaction_type: Optional[str] = None
):    
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM transactions"
    conditions = []
    params = []

    if from_date:
        conditions.append("date >= ?")
        params.append(from_date)

    if to_date:
        conditions.append("date <= ?")
        params.append(to_date)

    if customer_name:
        conditions.append("customer_name = ?")
        params.append(customer_name)

    if transaction_type:
        conditions.append("transaction_type = ?")
        params.append(transaction_type)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY date DESC, id DESC"

    cursor.execute(query, params)
    transactions = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return transactions

# Get transactions by date
@app.get("/api/transactions/date/{date}")
async def get_transactions_by_date(date: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM transactions WHERE date = ? ORDER BY id DESC",
        (date,)
    )
    transactions = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return transactions

# Get transactions by customer
@app.get("/api/transactions/customer/{customer_name}")
async def get_transactions_by_customer(customer_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM transactions WHERE customer_name = ? ORDER BY date DESC, id DESC",
        (customer_name,)
    )
    transactions = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return transactions

# Get all credits (customers with outstanding balances)
@app.get("/api/credits")
async def get_credits():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
    SELECT 
        customer_name,
        SUM(CASE WHEN transaction_type = 'sale' THEN outstanding ELSE 0 END) -
        SUM(CASE WHEN transaction_type = 'repayment' THEN (cash + hdfc + gpay) ELSE 0 END) as total_outstanding,
        MIN(date) as first_date,
        MAX(date) as last_date,
        JULIANDAY('now') - JULIANDAY(MIN(date)) as days_outstanding
    FROM transactions
    GROUP BY customer_name
    HAVING total_outstanding > 0
    ORDER BY days_outstanding DESC
    ''')

    credits = []
    for row in cursor.fetchall():
        row_dict = dict(row)
        
        # Add status based on days outstanding
        days = row_dict['days_outstanding']
        if days > 90:
            status = "Overdue"
        elif days > 30:
            status = "Warning"
        else:
            status = "Good"
        
        row_dict['status'] = status
        credits.append(row_dict)

    conn.close()
    return credits

# Get credit details for a specific customer
@app.get("/api/credits/{customer_name}")
async def get_credit_details(customer_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get customer credit summary
    cursor.execute('''
    SELECT 
        customer_name,
        SUM(CASE WHEN transaction_type = 'sale' THEN outstanding ELSE 0 END) -
        SUM(CASE WHEN transaction_type = 'repayment' THEN (cash + hdfc + gpay) ELSE 0 END) as total_outstanding,
        MIN(date) as first_date,
        MAX(date) as last_date,
        JULIANDAY('now') - JULIANDAY(MIN(date)) as days_outstanding
    FROM transactions
    WHERE customer_name = ?
    GROUP BY customer_name
    ''', (customer_name,))

    credit = dict(cursor.fetchone() or {})

    if not credit:
        raise HTTPException(status_code=404, detail=f"Customer {customer_name} not found")

    # Add status based on days outstanding
    days = credit.get('days_outstanding', 0)
    if days > 90:
        status = "Overdue"
    elif days > 30:
        status = "Warning"
    else:
        status = "Good"

    credit['status'] = status

    conn.close()
    return credit

# Get payment timeline for a customer
@app.get("/api/credits/{customer_name}/timeline")
async def get_credit_timeline(customer_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get timeline data
    cursor.execute('''
    SELECT 
        date,
        SUM(CASE WHEN transaction_type = 'sale' THEN outstanding ELSE 0 END) -
        SUM(CASE WHEN transaction_type = 'repayment' THEN (cash + hdfc + gpay) ELSE 0 END) as balance
    FROM transactions
    WHERE customer_name = ?
    GROUP BY date
    ORDER BY date
    ''', (customer_name,))

    timeline = [dict(row) for row in cursor.fetchall()]

    # Get payment method breakdown
    cursor.execute('''
    SELECT 
        SUM(cash) as cash_total,
        SUM(hdfc) as hdfc_total,
        SUM(gpay) as gpay_total
    FROM transactions
    WHERE customer_name = ? AND (cash > 0 OR hdfc > 0 OR gpay > 0)
    ''', (customer_name,))

    payment_totals = dict(cursor.fetchone() or {})

    payment_methods = []
    total_payments = sum(payment_totals.values())

    if total_payments > 0:
        for method, amount in [
            ("Cash", payment_totals.get('cash_total', 0)),
            ("HDFC", payment_totals .get('hdfc_total', 0)),
            ("GPay", payment_totals.get('gpay_total', 0))
        ]:
            if amount > 0:
                percentage = round((amount / total_payments) * 100)
                payment_methods.append({
                    "method": method,
                    "percentage": percentage
                })

    conn.close()
    return {
        "timeline": timeline,
        "payment_methods": payment_methods
    }

# Get daily summary for a specific date
@app.get("/api/reports/daily/{date}")
async def get_daily_summary(date: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
    SELECT 
        ? as date,
        SUM(CASE WHEN transaction_type = 'sale' THEN sales ELSE 0 END) as total_sales,
        SUM(cash) as total_cash,
        SUM(hdfc) as total_hdfc,
        SUM(gpay) as total_gpay,
        SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as total_payment,
        SUM(cash) + SUM(hdfc) + SUM(gpay) as total_received,
        SUM(CASE WHEN transaction_type = 'sale' THEN outstanding ELSE 0 END) as total_outstanding,
        (SUM(cash) + SUM(hdfc) + SUM(gpay)) - SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as net_cash_flow
    FROM transactions
    WHERE date = ?
    ''', (date, date))

    summary = dict(cursor.fetchone() or {})

    # If no data for this date, return zeros
    if not summary.get('total_sales'):
        summary = {
            "date": date,
            "total_sales": 0,
            "total_cash": 0,
            "total_hdfc": 0,
            "total_gpay": 0,
            "total_payment": 0,
            "total_received": 0,
            "total_outstanding": 0,
            "net_cash_flow": 0
        }

    conn.close()
    return summary

# Get chart data for a specific date
@app.get("/api/reports/daily/{date}/charts")
async def get_daily_charts(date: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get payment method distribution
    cursor.execute('''
    SELECT 
        SUM(cash) as cash_total,
        SUM(hdfc) as hdfc_total,
        SUM(gpay) as gpay_total
    FROM transactions
    WHERE date = ? AND (cash > 0 OR hdfc > 0 OR gpay > 0)
    ''', (date,))

    payment_totals = dict(cursor.fetchone() or {})

    payment_methods = []
    total_payments = sum(filter(None, payment_totals.values()))

    if total_payments > 0:
        for method, amount in [
            ("Cash", payment_totals.get('cash_total', 0) or 0),
            ("HDFC", payment_totals.get('hdfc_total', 0) or 0),
            ("GPay", payment_totals.get('gpay_total', 0) or 0)
        ]:
            if amount > 0:
                percentage = round((amount / total_payments) * 100)
                payment_methods.append({
                    "method": method,
                    "amount": amount,
                    "percentage": percentage
                })

    # Get transaction type distribution
    cursor.execute('''
    SELECT 
        transaction_type,
        COUNT(*) as count
    FROM transactions
    WHERE date = ?
    GROUP BY transaction_type
    ''', (date,))

    transaction_types_raw = [dict(row) for row in cursor.fetchall()]

    transaction_types = []
    total_transactions = sum(t['count'] for t in transaction_types_raw)

    if total_transactions > 0:
        for t in transaction_types_raw:
            percentage = round((t['count'] / total_transactions) * 100)
            transaction_types.append({
                "type": t['transaction_type'],
                "count": t['count'],
                "percentage": percentage
            })

    conn.close()
    return {
        "payment_methods": payment_methods,
        "transaction_types": transaction_types
    }

# Get list of all daily reports
@app.get("/api/reports/daily")
async def get_daily_reports(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None
):
    
    conn = get_db_connection()
    cursor = conn.cursor()

    query = '''
    SELECT 
        date,
        SUM(CASE WHEN transaction_type = 'sale' THEN sales ELSE 0 END) as total_sales,
        SUM(cash) + SUM(hdfc) + SUM(gpay) as total_received,
        SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as total_expenses,
        (SUM(cash) + SUM(hdfc) + SUM(gpay)) - SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as net_cash_flow
    FROM transactions
    '''

    conditions = []
    params = []

    if from_date:
        conditions.append("date >= ?")
        params.append(from_date)

    if to_date:
        conditions.append("date <= ?")
        params.append(to_date)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " GROUP BY date ORDER BY date DESC"

    cursor.execute(query, params)
    reports = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return reports

# Get latest daily summary
@app.get("/api/reports/latest")
async def get_latest_summary():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get the latest date
    cursor.execute("SELECT MAX(date) as latest_date FROM transactions")
    latest_date = cursor.fetchone()['latest_date']

    if not latest_date:
        return None

    # Get summary for the latest date
    cursor.execute('''
    SELECT 
        ? as date,
        SUM(CASE WHEN transaction_type = 'sale' THEN sales ELSE 0 END) as total_sales,
        SUM(cash) + SUM(hdfc) + SUM(gpay) as total_received,
        SUM(CASE WHEN transaction_type = 'sale' THEN outstanding ELSE 0 END) as total_outstanding,
        SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as total_expenses,
        (SUM(cash) + SUM(hdfc) + SUM(gpay)) - SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as net_cash_flow
    FROM transactions
    WHERE date = ?
    ''', (latest_date, latest_date))

    summary = dict(cursor.fetchone() or {})

    conn.close()
    return summary

# Get summary statistics for a date range
@app.get("/api/reports/summary")
async def get_summary_stats(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None
):
    
    conn = get_db_connection()
    cursor = conn.cursor()

    query = '''
    SELECT 
        SUM(CASE WHEN transaction_type = 'sale' THEN sales ELSE 0 END) as total_sales,
        SUM(cash) + SUM(hdfc) + SUM(gpay) as total_received,
        SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as total_expenses,
        (SUM(cash) + SUM(hdfc) + SUM(gpay)) - SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as net_cash_flow
    FROM transactions
    '''

    conditions = []
    params = []

    if from_date:
        conditions.append("date >= ?")
        params.append(from_date)

    if to_date:
        conditions.append("date <= ?")
        params.append(to_date)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    cursor.execute(query, params)
    stats = dict(cursor.fetchone() or {})

    # Get total outstanding (current)
    cursor.execute('''
    SELECT 
        SUM(CASE WHEN transaction_type = 'sale' THEN outstanding ELSE 0 END) -
        SUM(CASE WHEN transaction_type = 'repayment' THEN (cash + hdfc + gpay) ELSE 0 END) as total_outstanding
    FROM transactions
    ''')

    outstanding = cursor.fetchone()['total_outstanding'] or 0
    stats['total_outstanding'] = outstanding

    # Add date range to response
    stats['date_range'] = {
        "from": from_date or "all",
        "to": to_date or "all"
    }

    conn.close()
    return stats

# Get chart data for reports
@app.get("/api/reports/charts")
async def get_chart_data (
    from_date: Optional[str] = None,
    to_date: Optional[str] = None
):
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # Determine date range
    if not from_date:
        cursor.execute("SELECT MIN(date) as min_date FROM transactions")
        from_date = cursor.fetchone()['min_date']

    if not to_date:
        cursor.execute("SELECT MAX(date) as max_date FROM transactions")
        to_date = cursor.fetchone()['max_date']

    # Get all dates in range
    date_range = []
    start_date = datetime.strptime(from_date, "%Y-%m-%d")
    end_date = datetime.strptime(to_date, "%Y-%m-%d")

    current_date = start_date
    while current_date <= end_date:
        date_range.append(current_date.strftime("%Y-%m-%d"))
        current_date += timedelta(days=1)

    # Get data for each date
    dates = []
    sales = []
    received = []
    expenses = []
    outstanding = []
    net_cash_flow = []

    for date in date_range:
        cursor.execute('''
        SELECT 
            SUM(CASE WHEN transaction_type = 'sale' THEN sales ELSE 0 END) as total_sales,
            SUM(cash) + SUM(hdfc) + SUM(gpay) as total_received,
            SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as total_expenses,
            SUM(CASE WHEN transaction_type = 'sale' THEN outstanding ELSE 0 END) as total_outstanding,
            (SUM(cash) + SUM(hdfc) + SUM(gpay)) - SUM(CASE WHEN transaction_type = 'expense' THEN payment ELSE 0 END) as net_cash_flow
        FROM transactions
        WHERE date = ?
        ''', (date,))
        
        row = dict(cursor.fetchone() or {})
        
        dates.append(date)
        sales.append(row.get('total_sales') or 0)
        received.append(row.get('total_received') or 0)
        expenses.append(row.get('total_expenses') or 0)
        outstanding.append(row.get('total_outstanding') or 0)
        net_cash_flow.append(row.get('net_cash_flow') or 0)

    conn.close()
    return {
        "dates": dates,
        "sales": sales,
        "received": received,
        "expenses": expenses,
        "outstanding": outstanding,
        "net_cash_flow": net_cash_flow
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 