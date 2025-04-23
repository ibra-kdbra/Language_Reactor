import System.CPUTime
import Control.Monad

isPrime :: Int -> Bool
isPrime n | n <= 1 = False
          | otherwise = null [x | x <- [2..floor . sqrt $ fromIntegral n], n `mod` x == 0]

main :: IO ()
main = do
    start <- getCPUTime
    let c = length $ filter isPrime [0..9000000]
    print c
    end <- getCPUTime
    let diff = (fromIntegral (end - start)) / (10^12)
    printf "Computation time: %0.3f sec\n" (diff :: Double)
