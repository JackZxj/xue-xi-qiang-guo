auto(); // 打开无障碍服务

if (quickSettings()) {
    sleep(2000)
    click(200, 1300) // 控制栏的锁屏
    sleep(2000)
    device.wakeUp() // 唤醒屏幕
    sleep(2000)
    swipe(200, 300, 200, 1000, 1000); // 下拉通知栏
    sleep(2000)
    click(230, 230) // 点击时间用于唤醒解锁界面
    sleep(2000)
    gesture(1000, [250, 1240], [540, 1240], [540, 1530], [830, 1240]) // 解锁手势
    sleep(2000)
    home() // 返回桌面
    toast('Succeed!');
} else {
    toast('failed');
}
