# Gpt4All Web UI

[![GitHub license](https://img.shields.io/github/license/ParisNeo/Gpt4All-webui)](https://github.com/ParisNeo/Gpt4All-webui/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/ParisNeo/Gpt4All-webui)](https://github.com/ParisNeo/Gpt4All-webui/issues)
[![GitHub stars](https://img.shields.io/github/stars/ParisNeo/Gpt4All-webui)](https://github.com/ParisNeo/Gpt4All-webui/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ParisNeo/Gpt4All-webui)](https://github.com/ParisNeo/Gpt4All-webui/network)

This is a Flask web application that provides a chat UI for interacting with the GPT4All chatbot. GPT4All is a language model built by Nomic-AI, a company specializing in natural language processing. The app uses Nomic-AI's API to communicate with the GPT4All model, which runs locally on the user's PC. The app allows users to send messages to the chatbot and view its responses in real-time. Additionally, users can export the entire chat history in text or JSON format.


**Note for Windows users:** At the moment, Nomic-AI has not provided a wheel for Windows, so you will need to use the app with the Windows Subsystem for Linux (WSL). We apologize for any inconvenience this may cause.


## Installation

To install the app, follow these steps:

1. Clone the GitHub repository:

```
git clone https://github.com/ParisNeo/Gpt4All-webui.git
```

2. Navigate to the project directory:

```
cd Gpt4All-webui
```

3. Run the appropriate installation script for your platform:

- On Windows with WSL:

  ```
  ./install.sh
  ```

- When Nomic add windows support you would be able to use this :

  ```
  install.bat
  ```


- On Linux or macOS:

  ```
  ./install.sh
  ```

These scripts will create a Python virtual environment and install the required dependencies.

## Usage

To launch the app, run the following command:
```
python app.py
```

This will start the Flask service and make the app available at http://localhost:5000. To use the app, open a web browser and navigate to this URL.

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](https://github.com/ParisNeo/Gpt4All-webui/blob/main/LICENSE) file for details.
This project is licensed under the Apache 2.0 License. See the [LICENSE](https://github.com/ParisNeo/Gpt4All-webui/blob/main/LICENSE) file for details.
