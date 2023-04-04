from pyllamacpp.model import Model

def new_text_callback(text: str):
    print(text, end="")

model = Model(ggml_model='./models/gpt4all-converted.bin', n_ctx=512)
print("====================== Test 1 =======================================================")
model.generate("Once upon a time, ", n_predict=128, new_text_callback=new_text_callback)
print("====================== Test 2 =======================================================")
model.generate("Hello, ", n_predict=128, new_text_callback=new_text_callback)
print("====================== Test 3 =======================================================")
print("ready")