const std = @import("std");

fn is_prime(n: u32) bool {
    if (n <= 1) return false;
    var i: u32 = 2;
    const end = @as(u32, @intFromFloat(@sqrt(@as(f32, @floatFromInt(n)))));
    while (i <= end) : (i += 1) {
        if (n % i == 0) return false;
    }
    return true;
}

pub fn main() !void {
    const start = std.time.milliTimestamp();
    var c: u32 = 0;
    var i: u32 = 0;
    while (i < 9000000) : (i += 1) {
        if (is_prime(i)) {
            c += 1;
        }
    }
    const end = std.time.milliTimestamp();
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{d}\n", .{c});
    try stdout.print("{d}ms\n", .{end - start});
}
