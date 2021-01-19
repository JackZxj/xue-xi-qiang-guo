auto(); // 无障碍服务
setScreenMetrics(1080, 2160); // 屏幕分辨率

var videoNum = 6; // 至少观看几个视频
var videoTimeInMinute = 8; // 视频至少观看几分钟(理论上6分钟就够了,但是app很奇怪它有时候没计算我的积分)
var articleNum = 7; // 一共阅读几篇文章
var articleCommentNum = 3; // 一共需要评论几篇文章
var articleTimeInMinute = 6; // 文章至少阅读几分钟
var city = "北京"; // 当前城市

// 设置左上角的提示内容
function setInfo(window, str) {
    ui.run(function () {
        window.text.setText(str);
    });
}
// 进入"我的积分"
function enterMyScore() {
    sleep(1000);
    id("cn.xuexi.android:id/comm_head_xuexi_score").findOne().click(); // 点击我的积分
    text("积分规则").waitFor(); // 等待页面刷新
    sleep(1000);

    swipe(200, 1950, 200, 500, 500); // 上滑
    sleep(2000);
}
// 长时间等待
function watchLongTime(timeInMinute, watchType) {
    if (timeInMinute < 1) {
        timeInMinute = 1;
    }
    for (var count = (timeInMinute - 1) * 6 + random(0, 6); count > 0; count--) {
        setInfo(w, watchType + "剩余" + (count * 10) + "秒");
        sleep(10 * 1000);
    }
}
// 查看提示，返回提示的字符串
function getTips() {
    // https://hyb1996.github.io/AutoJs-Docs/#/widgetsBasedAutomation?id=uiselectorfindone
    // findOne() 会阻塞直到找到控件，不会返回null
    var giveMeTips = text("查看提示").findOne();
    giveMeTips.click(); // 查看提示
    className("android.view.View").text("提示").waitFor(); // 等待提示出现
    var tips = className("android.view.View").text("提示").findOne(2000);
    var answer = tips.parent().parent().child(1).child(0); // 获取提示内容
    sleep(1000);
    back();
    sleep(1000);
    return answer.text();
}
// 选出正确答案，返回值为字符串数组，若找不到答案，则单选A
function getSelections(tips) {
    var answer = [];
    var dist = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (tips == null) {
        return ["A"];
    }
    // 选项值是否在提示中出现
    className("android.widget.ListView").findOne().children().forEach(
        (child, index) => {
            if (tips.indexOf(child.child(0).child(2).text()) != -1) {
                answer.push(dist[index]);
            }
        }
    );
    if (answer.length == 0) {
        setInfo(w, "找不到答案！");
        return ["A"];
    }
    setInfo(w, "选择" + answer);
    return answer;
}
// 检查填空长大于答案长度就全填1
function checkBlankAnswer(answer, blankParent) {
    setInfo(w, "填空：" + answer);
    sleep(2000);
    var blankLength = blankParent.childCount() - 1;
    if (answer.length < blankLength) {
        setInfo(w, "填空：" + answer + " 错误！");
        return "111111111111111111111111111111111111111"
    } else {
        return answer;
    }
}
// 填空题根据提示判断
function fillBlank(tips) {
    var blankParent = className("android.widget.EditText").findOne().parent();
    var answer = "";
    if (blankParent.parent().childCount() == 3) {
        // 如果待填空的项在题干中间
        var fragment0 = blankParent.parent().child(0).text(); // 空格前的文字
        var fragment2 = blankParent.parent().child(2).text(); // 空格后的文字
        var fragment0_last4 = fragment0.substring(fragment0.length - 4); // 空格前4字
        var fragment2_head4 = fragment2.substring(0, 4); // 空格后4字
        var index = tips.indexOf(fragment0_last4) + fragment0_last4.length; // 用空格前4字在提示中的位置，找答案可能的位置
        if (fragment0.length + fragment2.length < tips.length) {
            // 提示长度大于问题长度
            if (fragment2_head4.length == 1) {
                // 如果空格后是一个句号，则有几个空格就取几个字作为答案
                answer = tips.substring(index, index + blankParent.childCount() - 1);
            } else {
                // 如果空格后是正常的字，根据空格前后4个字的位置取答案
                answer = tips.substring(index, tips.indexOf(fragment2_head4));
            }
        } else {
            // 提示长度小于问题长度，取空格前4字在提示中的位置之后的所有字
            answer = tips.substring(index, tips.length);
        }
        answer = checkBlankAnswer(answer, blankParent);
    } else if (blankParent.parent().childCount() == 2) {
        // 如果待填空在开头（其实我没遇到这种题）
        var fragment = blankParent.parent().child(1).text();
        var index = tips.indexOf(fragment.substring(0, 4));
        if (index > 0) {
            answer = tips.substring(index - blankParent.childCount() - 1, index);
            answer = checkBlankAnswer(answer, blankParent);
        } else {
            setInfo(w, "无答案");
            answer = "111111111111111111111111111111111111111";
        }
    } else {
        setInfo(w, "未知题目种类");
        answer = "111111111111111111111111111111111111111";
    }
    setText(answer);
}
// 回答问题，questionsNum为问题数，每日/每周答题为5.专项为10
function answerQuestions(questionsNum) {
    sleep(1000);
    for (var i = 0; i < questionsNum; i++) {
        text("查看提示").waitFor(); // 阻塞直到页面刷新
        if (textContains("填空题").exists()) {
            sleep(1000);
            var tips = getTips();
            fillBlank(tips);
        } else if (textContains("单选题").exists() || textContains("多选题").exists()) {
            sleep(1000);
            var tips = getTips();
            answer = getSelections(tips);
            answer.forEach(
                item => {
                    sleep(random(50, 100) * 10);
                    className("android.view.View").textStartsWith(item).findOne().click();
                }
            )
        } else {
            setInfo(w, "未知题型")
        }

        sleep(random(50, 100) * 10);
        click(1000, 175); // 点击确定
        sleep(random(50, 100) * 10);
        click(1000, 175); // 如果错了就再点一下进入下一题
    }
}
// 进行每周/专项中没做的答题
function answerListQuestions(questionsNum, flag) {
    sleep(random(100, 200) * 10);
    var toDoList = text(flag).find(); // 找到包含flag的列表
    var noMoreQuestion = false;
    var endFlag = null;
    while (toDoList.size() == 0) { // 找到过期题目之前的待答题列表
        if (endFlag != null) {
            noMoreQuestion = true;
            sleep(random(50, 100) * 10);
            back();
            break;
        }
        swipe(200, 1950, 200, 500, 200); // 上滑
        sleep(random(100, 200) * 10);
        endFlag = text("已过期").findOne(2000);
        toDoList = text(flag).find();
    }
    if (!noMoreQuestion) { // 如果存在未做的题
        toDoList[0].click();
        sleep(random(100, 200) * 10);
        answerQuestions(questionsNum);
        sleep(random(100, 200) * 10);
        back(); // 返回答题列表
        sleep(random(100, 200) * 10);
        back(); // 返回积分列表
    }
}

var comment = [
    "爱迪生：天才是百分之一的勤奋加百分之九十九的汗水。",
    "查尔斯·史：一个人几乎可以在任何他怀有无限热忱的事情上成功。",
    "培根说过，深窥自己的心，而后发觉一切的奇迹在你自己。",
    "歌德曾经：流水在碰到底处时才会释放活力。",
    "莎士比亚：那脑袋里的智慧，就像打火石里的火花一样，不去打它是不肯出来的。",
    "戴尔·卡耐基：多数人都拥有自己不了解的能力和机会，都有可能做到未曾梦想的事情。",
    "白哲特：坚强的信念能赢得强者的心，并使他们变得更坚强。",
    "伏尔泰： 不经巨大的困难，不会有伟大的事业。",
    "富勒曾经： 苦难磨炼一些人，也毁灭另一些人。",
    "文森特·皮尔： 改变你的想法，你就改变了自己的世界。",
    "拿破仑·希尔： 不要等待，时机永远不会恰到好处。",
    "塞涅卡： 生命如同寓言，其价值不在与长短，而在与内容。",
    "奥普拉·温弗瑞： 你相信什么，你就成为什么样的人。",
    "吕凯特： 生命不可能有两次，但许多人连一次也不善于度过。",
    "莎士比亚： 人的一生是短的，但如果卑劣地过这一生，就太长了。",
    "笛卡儿： 我的努力求学没有得到别的好处，只不过是愈来愈发觉自己的无知。",
    "左拉： 生活的道路一旦选定，就要勇敢地走到底，决不回头。",
    "米歇潘： 生命是一条艰险的峡谷，只有勇敢的人才能通过。",
    "吉姆·罗恩： 要么你主宰生活，要么你被生活主宰。",
    "日本谚语： 不幸可能成为通向幸福的桥梁。",
    "海贝尔： 人生就是学校。在那里，与其说好的教师是幸福，不如说好的教师是不幸。",
    "杰纳勒尔·乔治·S·巴顿： 接受挑战，就可以享受胜利的喜悦。",
    "德谟克利特： 节制使快乐增加并使享受加强。",
    "裴斯泰洛齐： 今天应做的事没有做，明天再早也是耽误了。",
    "歌德： 决定一个人的一生，以及整个命运的，只是一瞬之间。",
    "卡耐基： 一个不注意小事情的人，永远不会成就大事业。",
    "卢梭： 浪费时间是一桩大罪过。",
    "康德： 既然我已经踏上这条道路，那么，任何东西都不应妨碍我沿着这条路走下去。",
    "克劳斯·莫瑟爵士： 教育需要花费钱，而无知也是一样。",
    "伏尔泰： 坚持意志伟大的事业需要始终不渝的精神。",
    "亚伯拉罕·林肯： 你活了多少岁不算什么，重要的是你是如何度过这些岁月的。",
    "韩非： 内外相应，言行相称。",
    "富兰克林： 你热爱生命吗？那么别浪费时间，因为时间是组成生命的材料。",
    "马尔顿： 坚强的信心，能使平凡的人做出惊人的事业。",
    "笛卡儿： 读一切好书，就是和许多高尚的人谈话。",
    "塞涅卡： 真正的人生，只有在经过艰难卓绝的斗争之后才能实现。",
    "易卜生： 伟大的事业，需要决心，能力，组织和责任感。",
    "歌德： 没有人事先了解自己到底有多大的力量，直到他试过以后才知道。",
    "达尔文： 敢于浪费哪怕一个钟头时间的人，说明他还不懂得珍惜生命的全部价值。",
    "佚名： 感激每一个新的挑战，因为它会锻造你的意志和品格。",
    "奥斯特洛夫斯基： 共同的事业，共同的斗争，可以使人们产生忍受一切的力量。　",
    "苏轼： 古之立大事者，不惟有超世之才，亦必有坚忍不拔之志。",
    "王阳明： 故立志者，为学之心也；为学者，立志之事也。",
    "歌德： 读一本好书，就如同和一个高尚的人在交谈。",
    "乌申斯基： 学习是劳动，是充满思想的劳动。",
    "别林斯基： 好的书籍是最贵重的珍宝。",
    "富兰克林： 读书是易事，思索是难事，但两者缺一，便全无用处。",
    "鲁巴金： 读书是在别人思想的帮助下，建立起自己的思想。",
    "培根： 合理安排时间，就等于节约时间。",
    "屠格涅夫： 你想成为幸福的人吗？但愿你首先学会吃得起苦。",
    "莎士比亚： 抛弃时间的人，时间也抛弃他。",
    "叔本华： 普通人只想到如何度过时间，有才能的人设法利用时间。",
    "博： 一次失败，只是证明我们成功的决心还够坚强。 维",
    "拉罗什夫科： 取得成就时坚持不懈，要比遭到失败时顽强不屈更重要。",
    "莎士比亚： 人的一生是短的，但如果卑劣地过这一生，就太长了。",
    "俾斯麦： 失败是坚忍的最后考验。",
    "池田大作： 不要回避苦恼和困难，挺起身来向它挑战，进而克服它。",
    "莎士比亚： 那脑袋里的智慧，就像打火石里的火花一样，不去打它是不肯出来的。",
    "希腊： 最困难的事情就是认识自己。",
    "黑塞： 有勇气承担命运这才是英雄好汉。",
    "非洲： 最灵繁的人也看不见自己的背脊。",
    "培根： 阅读使人充实，会谈使人敏捷，写作使人精确。",
    "斯宾诺莎： 最大的骄傲于最大的自卑都表示心灵的最软弱无力。",
    "西班牙： 自知之明是最难得的知识。",
    "塞内加： 勇气通往天堂，怯懦通往地狱。",
    "赫尔普斯： 有时候读书是一种巧妙地避开思考的方法。",
    "笛卡儿： 阅读一切好书如同和过去最杰出的人谈话。",
    "邓拓： 越是没有本领的就越加自命不凡。",
    "爱尔兰： 越是无能的人，越喜欢挑剔别人的错儿。",
    "老子： 知人者智，自知者明。胜人者有力，自胜者强。",
    "歌德： 意志坚强的人能把世界放在手中像泥块一样任意揉捏。",
    "迈克尔·F·斯特利： 最具挑战性的挑战莫过于提升自我。",
    "爱迪生： 失败也是我需要的，它和成功对我一样有价值。",
    "罗素·贝克： 一个人即使已登上顶峰，也仍要自强不息。",
    "马云： 最大的挑战和突破在于用人，而用人最大的突破在于信任人。",
    "雷锋： 自己活着，就是为了使别人过得更美好。",
    "布尔沃： 要掌握书，莫被书掌握；要为生而读，莫为读而生。",
    "培根： 要知道对好事的称颂过于夸大，也会招来人们的反感轻蔑和嫉妒。",
    "莫扎特： 谁和我一样用功，谁就会和我一样成功。",
    "马克思： 一切节省，归根到底都归结为时间的节省。",
    "莎士比亚： 意志命运往往背道而驰，决心到最后会全部推倒。",
    "卡莱尔： 过去一切时代的精华尽在书中。",
    "培根： 深窥自己的心，而后发觉一切的奇迹在你自己。",
    "罗曼·罗兰： 只有把抱怨环境的心情，化为上进的力量，才是成功的保证。",
    "孔子： 知之者不如好之者，好之者不如乐之者。",
    "达·芬奇： 大胆和坚定的决心能够抵得上武器的精良。",
    "叔本华： 意志是一个强壮的盲人，倚靠在明眼的跛子肩上。",
    "黑格尔： 只有永远躺在泥坑里的人，才不会再掉进坑里。",
    "普列姆昌德： 希望的灯一旦熄灭，生活刹那间变成了一片黑暗。",
    "维龙： 要成功不需要什么特别的才能，只要把你能做的小事做得好就行了。",
    "郭沫若： 形成天才的决定因素应该是勤奋。",
    "洛克： 学到很多东西的诀窍，就是一下子不要学很多。",
    "西班牙： 自己的鞋子，自己知道紧在哪里。",
    "拉罗什福科： 我们唯一不会改正的缺点是软弱。",
    "亚伯拉罕·林肯： 我这个人走得很慢，但是我从不后退。",
    "美华纳： 勿问成功的秘诀为何，且尽全力做你应该做的事吧。",
    "俾斯麦： 对于不屈不挠的人来说，没有失败这回事。",
    "阿卜·日·法拉兹： 学问是异常珍贵的东西，从任何源泉吸收都不可耻。",
    "白哲特： 坚强的信念能赢得强者的心，并使他们变得更坚强。 ",
    "查尔斯·史考伯： 一个人几乎可以在任何他怀有无限热忱的事情上成功。 ",
    "贝多芬： 卓越的人一大优点是：在不利与艰难的遭遇里百折不饶。",
    "莎士比亚： 本来无望的事，大胆尝试，往往能成功。",
    "卡耐基： 我们若已接受最坏的，就再没有什么损失。",
    "德国： 只有在人群中间，才能认识自己。",
    "史美尔斯： 书籍把我们引入最美好的社会，使我们认识各个时代的伟大智者。",
    "冯学峰： 当一个人用工作去迎接光明，光明很快就会来照耀着他。",
    "吉格·金克拉： 如果你能做梦，你就能实现它。"
];

var w = floaty.window(
    <frame gravity="center" bg="#88ffccee">
        <text id="text">学习强国！</text>
    </frame>
);

if (!device.isScreenOn()) { // 如果在息屏状态
    sleep(2000);
    device.wakeUp(); // 唤醒屏幕
    sleep(2000);
    swipe(200, 300, 200, 1000, 1000); // 下拉通知栏
    sleep(2000);
    click(230, 230); // 点击时间用于唤醒解锁界面
    sleep(2000);
    gesture(1000, [250, 1240], [540, 1240], [540, 1530], [830, 1240]); // 解锁手势
    sleep(random(10, 100) * 100); // 休眠若干秒
    toast('成功解锁!');
}

// kill xxqg
openAppSetting(getPackageName("学习强国"));
sleep(1500);
click(500, 100); // 如果有弹窗，点击空白处关掉弹窗
sleep(500);
click(350, 2050); // 结束运行
sleep(1500);
click("确定");
sleep(1500);

app.launchApp("学习强国");
sleep(7000);
toast('脚本正在运行');
sleep(3000);

click(330, 2080); // 点击百灵
sleep(3000);
click(330, 2080); // 刷新百灵
sleep(5000); // 延长至5秒以防网络不太好刷不出来
click(random(300, 800), random(350, 900)); // 打开顶部第一个视频
// toast('视频学习开始！');
setInfo(w, "视频学习开始！")

for (var i = 0; i < videoNum; i++) {
    setInfo(w, "视频" + (i + 1));
    sleep(random(130, 180) * 100); // 看13~18秒
    swipe(random(300, 800), random(1800, 2000), random(300, 800), random(500, 700), random(13, 18) * 100) // 上滑切换
}
// 最后一个视频看久一点
watchLongTime(videoTimeInMinute, "视频");

setInfo(w, '视频学习结束！');
back();
sleep(3000);

click(540, 2080); // 点击学习
sleep(3000);
// click(1025, 270); // 展开频道
click(925, 270); // v2.19 展开频道
sleep(3000);
// click(930, 415); // 点击本地
// text(city).findOne().parent().parent().click(); // 点击本地
click(city); // 点击本地
sleep(3000);
var tv = textEndsWith('卫视').findOne(); // 点击卫视观看
click(tv.text());
setInfo(w, '浏览本地频道: ' + tv.text());
sleep(10000); // 等待10秒
back();
sleep(3000);

setInfo(w, '开始学习文章');
// click(1025, 270); // 展开频道
click(925, 270); // v2.19 展开频道
sleep(3000);
click("订阅"); // 点击订阅
sleep(3000);

for (var i = 0; i < articleNum; i++) {
    setInfo(w, '正在阅读第' + (i + 1) + '篇文章');
    sleep(3000);
    swipe(random(300, 800), random(1500, 2000), random(300, 800), random(500, 1000), random(500, 1000)) // 随机上滑
    sleep(3000);
    click(random(1035, 1060), random(500, 700)); // 随机点开 (点击屏幕边缘防止订阅的有视频打断操作)
    sleep(10 * 1000); // 等待10秒
    if (!text("欢迎发表你的观点").exists() ||
        className("android.widget.SeekBar").exists()) { // 如果无法评论或者顶部有视频，则跳过
        i--;
        back();
        continue;
    }
    if (i < articleCommentNum) {
        click(random(110, 580), random(2070, 2130)); // 点开评论
        sleep(3000);
        setText(comment[random(0, comment.length - 1)]); // 评论
        sleep(3000);
        click("发布"); // 点击发布
        sleep(3000);
        click(random(850, 900), random(2070, 2130)) // 收藏
        sleep(3000);
        click(random(970, 1020), random(2070, 2130)) // 分享
        sleep(3000);
        click(random(880, 1000), random(1320, 1444)) // 分享到短信
        sleep(3000);
        app.launchApp("学习强国"); // 回到学习强国
        sleep(3000);
    } else if (i != articleNum - 1) {
        sleep(random(50, 100) * 100); // 其他文章阅读15~20秒
    } else {
        watchLongTime(articleTimeInMinute, "文章"); // 最后一篇文章阅读久一点
    }
    setInfo(w, "文章阅读完成");
    back(); // 返回学习强国首页
    sleep(3000);
}

enterMyScore(); // 进入我的积分
var examList = text("去答题").find(); // 获取答题列表
while (examList.size() > 1) {
    examList[0].click(); // 每日答题
    answerQuestions(5);
    sleep(random(50, 100) * 10);
    back();
    sleep(random(200, 300) * 10);
    examList = text("去答题").find(); // 获取答题列表
}
setInfo(w, "每日答题 OK");
sleep(random(100, 200) * 10);

if (!text("去答题").exists()) {
    toast("未找到每周答题，跳过");
    // throw SyntaxError(); // 提前结束运行
} else {
    examList[0].click(); // 每周答题
    className("android.view.View").text("本月").waitFor(); // 等待页面刷新
    answerListQuestions(5, "未作答");
    setInfo(w, "每周答题 OK");
    sleep(random(100, 200) * 10);
}


// 专项答题
var specialQuestions = className("android.view.View").text("专项答题").findOne();
if ("去看看" == specialQuestions.parent().parent().child(3).text()) { // 专项答题还没拿满分
    specialQuestions.parent().parent().child(3).click(); // 进入专项答题
    className("android.view.View").textEndsWith("专项答题").waitFor(); // 等待页面刷新
    answerListQuestions(10, "开始答题");
    setInfo(w, "专项答题 OK");
    sleep(random(100, 200) * 10);
} else {
    toast("专项答题已完成，跳过");
}


var scoreTodayText = className("android.view.View").textStartsWith("今日已累积").findOne().text();
var scoreToday = scoreTodayText.substring(6, scoreTodayText.length - 2);
if (40 > scoreToday) {
    setInfo(w, "积分：" + scoreToday);
    // 提醒10秒积分不足
    for (var i = 4; i > 0; i--) {
        device.vibrate(500); // 震动0.5秒
        sleep(2000);
    }
    alert("积分不足!");
} else {
    toast("完成！");
    device.vibrate(1000); // 震动1秒
}
