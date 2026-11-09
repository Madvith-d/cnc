# Experiment 7: Frame Sorting Technique Used in Buffers
# Concept: Packets in packet-switched networks traverse diverse paths and may arrive
# out of order. Receiver buffers use sequence numbers to sort and reassemble data.

import random

DATA_SZ = 3


def bubb_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]


if __name__ == "__main__":
    msg = input("Enter the message:")
    # Fragment message into chunks of DATA_SZ characters
    msg_chunks = [msg[i:i + DATA_SZ] for i in range(0, len(msg), DATA_SZ)]

    # Assign sequential frame sequence numbers starting from 1
    frames = list(enumerate(msg_chunks, start=1))
    print("Fragmented frames:", frames)

    # Simulate out-of-order network arrival by shuffling
    for i in range(len(frames)):
        j = random.randint(0, len(frames) - 1)
        frames[i], frames[j] = frames[j], frames[i]
    print("Shuffled frames:", frames)

    # Sort frames in receiver buffer by sequence number
    bubb_sort(frames)
    print("Sorted frames:", frames)

    # Reassemble original stream
    print("Sorted message:" + "".join(x[1] for x in frames))