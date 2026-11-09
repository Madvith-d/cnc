import socket
import re
servSocket = socket.socket(socket.AF_INET , socket.SOCK_DGRAM)

servSocket.bind(("127.0.0.1" , 8081))
print("UDP server started")
while True :
    data , adress  = servSocket.recvfrom(1024)
    expression = data.decode()
    num1 , num2 = re.split('\+|-|\*|/|%' , expression)
    num1 = float(num1)
    num2 = float(num2)

    result = 0
    if '+' in expression :
        result = num1 + num2
    elif '-' in expression:
        result = num1 - num2
    elif '*' in expression:
        result = num1 * num2
    elif '/' in expression:
        if num2 == 0:
            result = "Invalid"
        else:
            result = num1 / num2
    elif '%' in expression:
        result = num1 % num2
    else :
        result = "Invalid Expression"
    
    print(f"expression received from client {adress} : {expression}")
    print(f"Calcultated result : {result}")

    servSocket.sendto(str(result).encode() , adress)


servSocket.close()
