from json import loads


def toCopyString(matrix) -> str:
    return 'matrix(' + str(matrix).replace('Matrix([', '[').replace('])', ']')[1:-1].replace(' ', '') + ')'

def fromCopyString(string: str):
    return loads(string.replace('matrix(', '[').replace(')', ']'))