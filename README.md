# Gpt4All Web UI

[![GitHub license](https://img.shields.io/github/license/ParisNeo/Gpt4All-webui)](https://github.com/ParisNeo/Gpt4All-webui/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/ParisNeo/Gpt4All-webui)](https://github.com/ParisNeo/Gpt4All-webui/issues)
[![GitHub stars](https://img.shields.io/github/stars/ParisNeo/Gpt4All-webui)](https://github.com/ParisNeo/Gpt4All-webui/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ParisNeo/Gpt4All-webui)](https://github.com/ParisNeo/Gpt4All-webui/network)

This is a Flask web application that provides a chat UI for interacting with the GPT4All chatbot. GPT4All is a language model built by Nomic-AI, a company specializing in natural language processing. The app uses Nomic-AI's API to communicate with the GPT4All model, which runs locally on the user's PC. The app allows users to send messages to the chatbot and view its responses in real-time. Additionally, users can export the entire chat history in text or JSON format.


**Note for Windows users:** At the moment, Nomic-AI has not provided a wheel for Windows, so you will need to use the app with the Windows Subsystem for Linux (WSL). To install WSL, follow these steps:

1. Open the Windows Features settings (you can find this by searching for "Windows Features" in the Start menu).

2. Enable the "Windows Subsystem for Linux" feature.

3. Restart your computer when prompted.

4. Install a Linux distribution from the Microsoft Store (e.g., Ubuntu).

5. Open the Linux distribution and follow the prompts to create a new user account.

We apologize for any inconvenience this may cause. W


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


## Contribute

This is an open-source project by the community for the community. Our chatbot is a UI wrapper for Nomic AI's model, which enables natural language processing and machine learning capabilities.

We welcome contributions from anyone who is interested in improving our chatbot. Whether you want to report a bug, suggest a feature, or submit a pull request, we encourage you to get involved and help us make our chatbot even better.

Before contributing, please take a moment to review our [code of conduct](./CODE_OF_CONDUCT.md). We expect all contributors to abide by this code of conduct, which outlines our expectations for respectful communication, collaborative development, and innovative contributions.

### Reporting Bugs

If you find a bug or other issue with our chatbot, please report it by [opening an issue](https://github.com/your-username/your-chatbot/issues/new). Be sure to provide as much detail as possible, including steps to reproduce the issue and any relevant error messages.

### Suggesting Features

If you have an idea for a new feature or improvement to our chatbot, we encourage you to [open an issue](https://github.com/your-username/your-chatbot/issues/new) to discuss it. We welcome feedback and ideas from the community and will consider all suggestions that align with our project goals.

### Contributing Code

If you want to contribute code to our chatbot, please follow these steps:

1. Fork the repository and create a new branch for your changes.
2. Make your changes and ensure that they follow our coding conventions.
3. Test your changes to ensure that they work as expected.
4. Submit a pull request with a clear description of your changes and the problem they solve.

We will review your pull request as soon as possible and provide feedback on any necessary changes. We appreciate your contributions and look forward to working with you!

Please note that all contributions are subject to review and approval by our project maintainers. We reserve the right to reject any contribution that does not align with our project goals or standards.


## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](https://github.com/ParisNeo/Gpt4All-webui/blob/main/LICENSE) file for details.
This project is licensed under the Apache 2.0 License. See the [LICENSE](https://github.com/ParisNeo/Gpt4All-webui/blob/main/LICENSE) file for details.
