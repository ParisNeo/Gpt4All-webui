from flask import Flask, jsonify, request, render_template
from nomic.gpt4all import GPT4All
m = GPT4All()
m.open()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('chat.html')

@app.route('/bot', methods=['POST'])
def bot():
    message = request.json['message']
    response = {'message': f'You said: {message}. I am a bot.'}
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)