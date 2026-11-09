div = [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1]
m = len(div)
n = int(input("Enter no of bits"))

print("Enter the bits : \n")
if n < m :
    print("Invalid")
    exit()
data = []
for i in range(n) :
    bit = int(input())
    if bit not in [0 , 1]:
        print("Invalid bit")
        exit()
    else:
        data.append(bit)


cdata = data.copy() 
for i in range(m - 1):
    cdata.append(0)
print("Initial codeword : ", cdata)

for i in range(n):
    if cdata[i] == 1 :
        for j in range(m):
            cdata[i+j]^=div[j]
print(cdata)

for i in range(n,n+m-1):
    data.append(cdata[i])

print("Transmitted codeword :" , data)

choice = 0
print("Choose : \n1.Introduce Error \n2.No error")
choice = int(input())
if choice == 1 :
    p = int(input("Enter the position to indroduce error : "))
    if 1 <= p <= len(data):
        data[p-1]^=1
    else:
        print("Invalid Position")
print("Received message : ", data)
received = data.copy()
for i in range(n) :
        if data[i] == 1:
            for j in range(m):
                data[i+j]^=div[j]

flag = True

for i in data:
    if i == 1 :
        flag=False
        break
if flag :
    print("Valid data")
    print("Data bits : ")
    print(received[0:n])
   
else:
     print("Invalid data")
   

