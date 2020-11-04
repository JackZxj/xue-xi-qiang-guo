auto(); // 无障碍服务
setScreenMetrics(1080, 2160); // 屏幕分辨率

// if (quickSettings()) {
//     sleep(3000);
//     click(200, 1300); // 点击控制栏的锁屏
//     sleep(3000);
// } else {
//     alert("锁屏失败!");
//     exit();
// }

if (!device.isScreenOn()) { // 如果在息屏状态
    sleep(3000);
    device.wakeUp(); // 唤醒屏幕
    sleep(3000);
    swipe(200, 300, 200, 1000, 1000); // 下拉通知栏
    sleep(3000);
    click(230, 230); // 点击时间用于唤醒解锁界面
    sleep(3000);
    gesture(1000, [250, 1240], [540, 1240], [540, 1530], [830, 1240]); // 解锁手势
    sleep(random(10, 100) * 100); // 休眠若干秒
    toast('成功解锁!');
} else {
    sleep(3000);
    home(); // 返回桌面
}

sleep(3000);
openAppSetting(getPackageName("学习强国"));
sleep(3000);
click(350, 2050); // 结束运行
sleep(3000);
click("确定");
sleep(3000);
home();
sleep(3000);
if (quickSettings()) {
    sleep(3000);
    click(200, 1300); // 点击控制栏的锁屏
    sleep(3000);
} else {
    alert("锁屏失败!");
}
