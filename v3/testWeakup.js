auto(); // 无障碍服务
setScreenMetrics(1080, 2160); // 屏幕分辨率
sleep(1000);

if (device.isScreenOn()) {
    // 下拉控制栏
    if (quickSettings()) {
        sleep(2000);
        click(180, 1300); // 点击快捷操作栏中的锁屏
    }
}

sleep(3000);

if (!device.isScreenOn()) { // 如果在息屏状态
    sleep(2000);
    device.wakeUp(); // 唤醒屏幕
    sleep(2000);
    // swipe(200, 300, 200, 1000, 1000); // 下拉通知栏
    if (quickSettings()) {
        sleep(2000);
        click(850, 340); // 点击设置用于唤醒解锁界面
        sleep(2000);
        gesture(1000, [250, 1240], [540, 1240], [540, 1530], [830, 1240]); // 解锁手势
        // sleep(random(10, 100) * 100); // 休眠若干秒
        toast('成功解锁!');
    } else {
        for (var i = 4; i > 0; i--) {
            device.vibrate(500); // 震动0.5秒
            sleep(2000);
        }
        throw SyntaxError(); // 结束运行
    }
}