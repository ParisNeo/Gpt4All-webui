from flask import Flask, jsonify, request, render_template
from nomic.gpt4all import GPT4All
import argparse

m = GPT4All()
m.open()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('chat.html')

@app.route('/bot', methods=['POST'])
def bot():
    message = request.json['message']
    print(f"Received message {message}")
    
    response = m.prompt(message, write_to_stdout=True)
    print(f"response : {response}")
    print(type(response))
    return jsonify(response)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Launch Flask server with or without debug mode')
    parser.add_argument('--debug', dest='debug', action='store_true', help='launch Flask server in debug mode')
    parser.set_defaults(debug=False)

    args = parser.parse_args()

    if args.debug:
        app.run(debug=True, port=9600)
    else:
        app.run(port=9600)
