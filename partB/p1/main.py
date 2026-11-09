# Experiment 5: Bit Stuffing and Destuffing
# Concept: Insert a '0' after five consecutive '1's at the transmitter,
# and remove that '0' at the receiver to maintain frame delineation.

def bit_stuffing(data):
    stuffed_data = ""
    count = 0
    for bit in data:
        stuffed_data += bit
        if bit == '1':
            count += 1
            if count == 5:
                stuffed_data += '0'
                count = 0
        else:
            count = 0
    return stuffed_data


def bit_destuffing(stuffed_data):
    destuffed_data = ""
    count = 0
    skip_next = False
    for bit in stuffed_data:
        if skip_next:
            skip_next = False
            continue
        destuffed_data += bit
        if bit == '1':
            count += 1
            if count == 5:
                skip_next = True
                count = 0
        else:
            count = 0
    return destuffed_data



data = input("Enter the input data :")
print("Original data :", data)
stuffed = bit_stuffing(data)
print("Bit Stuffed data :", stuffed)
destuffed = bit_destuffing(stuffed)
print("Bit Destuffed data :", destuffed)