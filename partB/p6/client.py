import socket 

clientSocket = socket.socket(socket.AF_INET , socket.SOCK_DGRAM)
expression = input("Enter the expression")
clientSocket.sendto(expression.encode(), ("127.0.0.1" , 8081))

result , adress = clientSocket.recvfrom(1024)

print(f"Result : {result.decode()}")