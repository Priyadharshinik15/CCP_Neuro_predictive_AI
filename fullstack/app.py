import pandas as pd
import numpy as np
from flask import Flask, render_template, request, redirect, url_for, session,jsonify
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import math


app = Flask(__name__)

app.secret_key = 'some_random_secret_key'  
# ------------------ MYSQL CONFIG ------------------
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'  
app.config['MYSQL_PASSWORD'] = 'Priya@1'  
app.config['MYSQL_DB'] = 'user_db'

mysql = MySQL(app)

# ------------------ ML MODEL TRAINING ------------------

def train_model():
    global model, scaler, df
    df = pd.read_csv("rare_neuro_diseases_dataset.csv")
    X = df.drop("Disease", axis=1)
    y = df["Disease"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LogisticRegression()
    model.fit(X_scaled, y)

# ------------------ ROUTES ------------------
@app.route("/")
def enter():
    return render_template("enter.html")

@app.route("/home")
def home():
    return render_template("home.html")

# ------------------ LOGIN / REGISTER ------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    msg = ''
    if request.method == 'POST' and 'email' in request.form and 'password' in request.form:
        email = request.form['email']
        password = request.form['password']

        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user[3], password):  
            session['loggedin'] = True
            session['id'] = user[0]
            session['username'] = user[1]
            session['email'] = user[2]
            return redirect(url_for('predictive_form'))
        else:
            msg = 'Incorrect email/password!'
    
    return render_template('login.html', msg=msg)

@app.route('/register', methods=['GET', 'POST'])
def register():
    msg = ''
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form and 'email' in request.form:
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        hashed_password = generate_password_hash(password)

        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE username = %s OR email = %s', (username, email))
        account = cursor.fetchone()

        if account:
            msg = 'Account already exists!'
        elif not username or not password or not email:
            msg = 'Please fill out all fields!'
        else:
            cursor.execute(
                'INSERT INTO users (username, email, password) VALUES (%s, %s, %s)',
                (username, email, hashed_password)
            )
            mysql.connection.commit()
            msg = 'You have successfully registered!'
    elif request.method == 'POST':
        msg = 'Please fill out all fields!'
    return render_template('register.html', msg=msg)

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/help")
def help():
    return render_template("help.html")



# ------------------ PREDICTIVE FORM (Pandas + NumPy) ------------------

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "rare_neuro_diseases_dataset.csv")
df = pd.read_csv(csv_path)


@app.route('/predictive_form', methods=['GET', 'POST'])
def predictive_form():
    if request.method == 'POST':
        # Collect form data
        name = request.form['name']
        age = int(request.form['age'])
        gender = request.form['gender']
        memory_loss = int(request.form['memory_loss'])
        behaviour = int(request.form['behaviour'])
        tremors = int(request.form['tremors'])
        coordination = int(request.form['coordination'])
        seizures = int(request.form['seizures'])
        vision = int(request.form['vision'])
        copper = float(request.form['copper'])

        input_features = np.array([age, memory_loss, behaviour,
                                   tremors, coordination, seizures,
                                   vision, copper])

        feature_cols = ['Age','Memory_Loss', 'Behavior_Change',
                    'Tremors', 'Coordination_Loss',
                    'Seizures', 'Vision_Loss',
                    'Copper_Level']

        data_features = df[feature_cols].values

        distances = np.linalg.norm(data_features - input_features, axis=1)

        best_match_index = np.argmin(distances)
        predicted_disease = df.iloc[best_match_index]['Disease']
           # ---------------- HANDLE NaN ----------------
        if predicted_disease is None or (isinstance(predicted_disease, float) and math.isnan(predicted_disease)):
            predicted_disease = None
        # -------------------------------------------


        return render_template(
            "result.html",
            name=name,
            age=age,
            gender=gender,
            memory_loss=memory_loss,
            behaviour=behaviour,
            tremors=tremors,
            coordination=coordination,
            seizures=seizures,
            vision=vision,
            copper=copper,
            prediction=predicted_disease
        )

    return render_template("predictive_form.html")
        
# ------------------ DASHBOARD ------------------
@app.route("/dashboard")
def dashboard():
    # Count disease distribution
    disease_counts = df["Disease"].value_counts().to_dict()

    # Pass data to frontend
    return render_template("dashboard.html",
                           labels=list(disease_counts.keys()),
                           values=list(disease_counts.values()))

# ------------------ LOGOUT ------------------
@app.route('/logout')
def logout():
    session.clear()
    return render_template("logout.html")
@app.route('/healthypage')
def healthypage():
    return render_template("healthypage.html") 
#-------chatbot-----------


import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")

try:
    genai.configure(api_key=API_KEY)

    model = genai.GenerativeModel("gemini-2.5-flash")  
    chat = model.start_chat(history=[])
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    print("Please ensure you have set the GOOGLE_API_KEY environment variable.")
    chat = None  


# Route for chatbot page
@app.route("/chatbot")
def index():
    return render_template("index.html")


# Route to handle chat messages
@app.route("/chat", methods=["POST"])
def chat_message():
    if chat is None:
        return jsonify({"error": "AI model not configured. Please check API key."}), 500

    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        response = chat.send_message(user_message)
        bot_response = response.text
        return jsonify({"response": bot_response})
    except Exception as e:
        print(f"Error during chat interaction: {e}")
        return jsonify({"error": "An error occurred while processing your request."}), 500

#-------------rarediseases--------
from flask import Flask, render_template, session


@app.route("/aboutdiseases")
def aboutdiseases():
    return render_template("aboutdiseases.html")

@app.route("/wilson")
def wilson():
    return render_template("wilson.html")

@app.route("/wilson_prevention")
def wilson_prevention():
    return render_template("wilson_prevention.html")

@app.route("/cjd")
def cjd():
    return render_template("cjd.html")

@app.route("/cjd_prevention")
def cjd_prevention():
    return render_template("cjd_prevention.html")


@app.route("/npc")
def npc():
    return render_template("npc.html")
@app.route("/npc_prevention")
def npc_prevention():
    return render_template("npc_prevention.html")


@app.route("/batten")
def batten():
    return render_template("batten.html")

@app.route("/batten_prevention")
def batten_prevention():
    return render_template("batten_prevention.html")



# ------------------ MAIN ------------------
if __name__ == "__main__":
    app.run(debug=True)