from flask import Flask
from flask import request

app = Flask(__name__)


@app.route('/')
def index():
    return "Hello World"


@app.route('/about')
def about():
    return "About page"


@app.route('/', methods=['POST'])
def parse_request():
    data = request.data
    print(data)


if __name__ == "__main__":
    app.run(debug=True)
