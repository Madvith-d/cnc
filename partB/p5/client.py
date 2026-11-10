
import socket

# Define server address and port number
server_address = ('localhost', 8888)

# Create a TCP socket
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Connect to the server
client_socket.connect(server_address)

# Ask the user for the file name
file_name = input("Enter the file name: ")

# Send the file name to the server
client_socket.send(file_name.encode())

# Receive file contents from the server
file_contents = client_socket.recv(1024)

# Check whether the file exists on the server
if file_contents == b'File not found':

    print("File not found on the server.")

else:

    # Convert received bytes into a string
    file_contents = file_contents.decode()

    print("File Contents:\n", file_contents)

    # Save the received contents into a new file
    new_file = "received_" + file_name

    with open(new_file, 'w') as file:
        file.write(file_contents)

    print("File received and saved as", new_file)

# Close the client socket
client_socket.close()
