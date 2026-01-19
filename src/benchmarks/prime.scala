import scala.math.sqrt
import java.time.Instant

object Main {
  def isPrime(n: Int): Boolean = {
    if (n <= 1) return false

    val end = sqrt(n).toInt
    for (i <- 2 to end) {
      if (n % i == 0) return false
    }
    true
  }

  def main(args: Array[String]): Unit = {
    val start = Instant.now.toEpochMilli
    var c = 0

    for (i <- 0 until 9000000) {
      if (isPrime(i)) c += 1
    }
    println(c)
    val end = Instant.now.toEpochMilli
    println(s"${end - start}ms")
  }
}
