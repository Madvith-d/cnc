
def sender():
    # Read the number of bits from the user
    n = int(input("Enter the no. of bits: "))

    # Read the input data bits
    print("Enter", n, "bits:")
    data = [int(input()) for _ in range(n)]

    # Flag pattern used to indicate the beginning and end of a frame
    add = [0, 1, 1, 1, 1, 1, 1, 0]

    # Initialize the frame with the starting flag
    frame = []
    frame += add

    count = 0

    # Perform bit stuffing
    for i in data:

        # Insert a 0 after every sequence of five consecutive 1s
        if count == 5:
            frame.append(0)
            count = 0

        # Append the original data bit
        frame.append(i)

        # Count consecutive 1s
        if i == 1:
            count += 1
        else:
            count = 0

    # Append the ending flag to the frame
    frame += add

    print("Sent Frame:", frame)

    # Pass the frame to the receiver
    receiver(frame)


def receiver(frame):
    # Initialize an empty list to store received data
    data = []

    count = 0

    # Remove the starting and ending flags
    # Process only the actual stuffed data
    for i in frame[8:-8]:

        if i == 1:
            data.append(i)
            count += 1

        elif i == 0:

            # If five consecutive 1s were received,
            # this 0 is a stuffed bit and must be removed
            if count == 5:
                count = 0

            else:
                # Otherwise, it is an original data bit
                data.append(i)
                count = 0

    print("Data Received is:", data)


# Main function call
sender()
