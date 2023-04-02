from flask import Flask, jsonify, request, render_template, Response, stream_with_context
from GPT4All import GPT4All
import argparse
import threading
from io import StringIO
import sys
import re
import sqlite3
from datetime import datetime

import sqlite3
import json
import time 
global current_discussion, running

running = False

current_discussion=None

#=================================== Database ==================================================================
class Discussion:
    def __init__(self, discussion_id, conn):
        self.discussion_id = discussion_id
        self.conn = conn
        self.cur = self.conn.cursor()

    @staticmethod
    def create_discussion(conn):
        title = request.form.get('untitled')
        cur = conn.cursor()
        cur.execute("INSERT INTO discussion (title) VALUES (?)", (title,))
        discussion_id = cur.lastrowid
        conn.commit()
        return Discussion(discussion_id, conn)

    def add_message(self, conn, sender, content):
        cur = conn.cursor()
        cur.execute('INSERT INTO message (sender, content, discussion_id) VALUES (?, ?, ?)',
                         (sender, content, self.discussion_id))
        self.conn.commit()

    def get_messages(self,conn):
        conn.cursor().execute('SELECT * FROM message WHERE discussion_id=?', (self.discussion_id,))
        return [{'sender': row[1], 'content': row[2]} for row in conn.cursor().fetchall()]

    def remove_discussion(self,conn):
        conn.cursor().execute('DELETE FROM discussion WHERE id=?', (self.discussion_id,))
        self.conn.commit()

def last_discussion_has_messages():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("SELECT * FROM message ORDER BY id DESC LIMIT 1")
    last_message = c.fetchone()
    conn.close()
    return last_message is not None

def export_to_json():
    conn = sqlite3.connect('database.db')
    cur = conn.cursor()
    cur.execute('SELECT * FROM discussion')
    discussions = []
    for row in cur.fetchall():
        discussion_id = row[0]
        discussion = {'id': discussion_id, 'messages': []}
        cur.execute('SELECT * FROM message WHERE discussion_id=?', (discussion_id,))
        for message_row in cur.fetchall():
            discussion['messages'].append({'sender': message_row[1], 'content': message_row[2]})
        discussions.append(discussion)
    with open('discussions.json', 'w') as f:
        json.dump(discussions, f)

def remove_discussions():
    conn = sqlite3.connect('database.db')
    cur = conn.cursor()
    cur.execute('DELETE FROM message')
    cur.execute('DELETE FROM discussion')
    conn.commit()

# create database schema
print("Checking discussions database...")
conn = sqlite3.connect('database.db')
cur = conn.cursor()
cur.execute('''
CREATE TABLE  IF NOT EXISTS discussion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT
)
''')
cur.execute('''
CREATE TABLE  IF NOT EXISTS message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    discussion_id INTEGER NOT NULL,
    FOREIGN KEY (discussion_id) REFERENCES discussion(id)
)
''')
conn.commit()
conn.close()
print("Done")
# ========================================================================================================================

m = GPT4All(decoder_config = {
            'temp': 0.01,
            'n_predict':128,
            'top_k':40,
            'top_p':0.95,
            #'color': True,#"## Instruction",
            'repeat_penalty': 1.3,
            'repeat_last_n':64,
            'ctx_size': 2048
          })
m.open()
# response = m.prompt("## Instruction Act as AI, a helpful and lovely chatbot built to intertain the user. AI:")
#print(response)
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('chat.html')

def format_message(message):
    # Look for a code block within the message
    pattern = re.compile(r"(```.*?```)", re.DOTALL)
    match = pattern.search(message)

    # If a code block is found, replace it with a <code> tag
    if match:
        code_block = match.group(1)
        message = message.replace(code_block, f"<code>{code_block[3:-3]}</code>")

    # Return the formatted message
    return message


@app.route('/stream')
def stream():
    def generate():
        # Replace this with your text-generating code
        for i in range(10):
            yield f'This is line {i+1}\n'
            time.sleep(1)

    return Response(stream_with_context(generate()))

@app.route('/new-discussion', methods=['POST'])
def new_discussion():
    global current_discussion
    
    current_discussion= Discussion()
    # Get the current timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Insert a new discussion into the database
    conn.cursor().execute("INSERT INTO discussions (created_at) VALUES (?)", (timestamp,))
    conn.commit()

    # Return a success response
    return json.dumps({'id': current_discussion.discussion_id})


@stream_with_context
def parse_to_prompt_stream():
    bot_says = ['']
    point = b''
    bot = m.bot
    while True:
        point += bot.stdout.read(1)
        try:
            character = point.decode("utf-8")
            if character == "\f": # We've replaced the delimiter character with this.
                return "<br>".join(bot_says)
            if character == "\n":
                bot_says.append('')
                yield '<br>'
            else:
                bot_says[-1] += character
                yield character
            point = b''

        except UnicodeDecodeError:
            if len(point) > 4:
                point = b''

@app.route('/bot', methods=['POST'])
def bot():
    global current_discussion
    conn = sqlite3.connect('database.db')
    try:
        if current_discussion is None or not last_discussion_has_messages():
            current_discussion=Discussion.create_discussion(conn)

        current_discussion.add_message(conn,"user",request.json['message'])    
        message = f"{request.json['message']}\n";
        print(f"Received message : {message}")
        bot = m.bot
        bot.stdin.write(message.encode('utf-8'))
        bot.stdin.write(b"\n")
        bot.stdin.flush()

        # Segmented (the user receives the output as it comes)
        return Response(stream_with_context(parse_to_prompt_stream()))
    
        # One shot response (the user should wait for the message to apear at once.)
        #response = format_message(m.prompt(message, write_to_stdout=True).lstrip('# '))
        #return jsonify(response)
    except Exception as ex:
        print(ex)
        conn.close()
        return jsonify(str(ex))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Launch Flask server with or without debug mode')
    parser.add_argument('--debug', dest='debug', action='store_true', help='launch Flask server in debug mode')
    parser.set_defaults(debug=False)

    args = parser.parse_args()

    if args.debug:
        app.run(debug=True, port=9600)
    else:
        app.run(port=9600)
