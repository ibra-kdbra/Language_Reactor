program prime_test
    implicit none
    integer :: i, c
    integer(8) :: start_time, end_time, rate

    call system_clock(start_time, rate)
    c = 0
    do i = 0, 8999999
        if (is_prime(i)) then
            c = c + 1
        end if
    end do
    call system_clock(end_time)

    print *, c
    print *, (end_time - start_time) * 1000 / rate, "ms"

contains
    logical function is_prime(n)
        integer, intent(in) :: n
        integer :: j, end_val
        if (n <= 1) then
            is_prime = .false.
            return
        end if
        end_val = int(sqrt(real(n)))
        do j = 2, end_val
            if (mod(n, j) == 0) then
                is_prime = .false.
                return
            end if
        end do
        is_prime = .true.
    end function is_prime
end program prime_test
