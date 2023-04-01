from flask import Flask, jsonify, request, render_template
from nomic.gpt4all import GPT4All
import argparse
import threading
from io import StringIO
import sys
m = GPT4All()
m.open()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('chat.html')

@app.route('/bot', methods=['POST'])
def bot():
    message = f"## Instruction {request.json['message']}";
    print(f"Received message {message}")
    
    response = m.prompt(message, write_to_stdout=True)
    print(f"response : {response}")
    print(type(response))
    return jsonify(response)


def generate(message):
    print(f"message {message}")

    stdout_buffer = StringIO()
    old_stdout = sys.stdout
    sys.stdout = stdout_buffer
    running = True
    def print_to_buffer():
        while running:
            data = stdout_buffer.getvalue()
            print(f"data {data}")
            yield f'data: {data}\n\n'
    thread = threading.Thread(target=print_to_buffer)
    thread.start()
    resp = m.prompt(message, write_to_stdout=True)
    sys.stdout = old_stdout
    running = False


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Launch Flask server with or without debug mode')
    parser.add_argument('--debug', dest='debug', action='store_true', help='launch Flask server in debug mode')
    parser.set_defaults(debug=False)

    args = parser.parse_args()

    if args.debug:
        app.run(debug=True, port=9600)
    else:
        app.run(port=9600)
