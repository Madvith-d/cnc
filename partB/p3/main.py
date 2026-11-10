
import random

DATA_SZ = 3

# Function to sort frames using Bubble Sort
def bubb_sort(arr):
    n = len(arr)

    for i in range(n):
        for j in range(n - i - 1):

            # Compare sequence numbers of two frames
            if arr[j][0] > arr[j + 1][0]:

                # Swap the frames
                temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp


if __name__ == "__main__":

    # Read the message from the user
    msg = input("Enter the message: ")

    # Divide the message into chunks of 3 characters
    msg_chunks = []

    for i in range(0, len(msg), DATA_SZ):
        chunk = msg[i:i + DATA_SZ]
        msg_chunks.append(chunk)

    # Assign sequence numbers to each frame
    frames = []
    seq = 1

    for chunk in msg_chunks:
        frames.append((seq, chunk))
        seq = seq + 1

    print("Fragmented frames:", frames)

    # Shuffle frames to simulate out-of-order arrival
    for i in range(len(frames)):
        j = random.randint(0, len(frames) - 1)

        temp = frames[i]
        frames[i] = frames[j]
        frames[j] = temp

    print("Shuffled frames:", frames)

    # Sort frames based on sequence numbers
    bubb_sort(frames)

    print("Sorted frames:", frames)

    # Reassemble the original message
    sorted_msg = ""

    for frame in frames:
        sorted_msg = sorted_msg + frame[1]

    print("Sorted message:", sorted_msg)
