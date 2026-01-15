import math, times

proc is_prime(n: int): bool =
  if n <= 1:
    return false
  let endVal = int(sqrt(float(n)))
  for i in 2..endVal:
    if n mod i == 0:
      return false
  return true

let start = cpuTime()
var c = 0
for i in 0..<9000000:
  if is_prime(i):
    inc c

let endTime = cpuTime()
echo c
echo int((endTime - start) * 1000), "ms"
