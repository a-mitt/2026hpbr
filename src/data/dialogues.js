import { isEnglish, t } from "../systems/i18n.js";

// 会話文。say(話者, 日本語, English)＝セリフ、think(日本語, English)＝地の文（話者は霊幻。ライブラリでは「」なしで載る）
// 霊幻の行の最後に表情（normal／happy／surprise／littlesad／smile／angry／alone）を足すと、立ち絵がその表情になる（省略は normal）
// 話者は内部では日本語名で扱う（表示は i18n の displayName で言語に合わせる）
const REIGEN = "霊幻";
const say = (speaker, ja, en, face) => ({ speaker, text: t(ja, en), face });
const think = (ja, en, face) => ({ speaker: REIGEN, text: t(ja, en), narration: true, face });
const reigen = (ja, en, face) => say(REIGEN, ja, en, face);

export const dialogues = {
  tome: [
    say("トメ", "なんか机の中にリボン入れてたでしょ？", "Weren't you keeping a ribbon in your desk drawer?"),
    say("トメ", "ネクタイもピンクだし、結構可愛いの好きなのかと思って！", "Your necktie's pink too, so I figured you must like cute things!"),
    say("トメ", "この前転んだ子供にハンカチ使ってたじゃない。使ってよ", "You used a handkerchief on that kid who fell the other day, remember? So use this one."),
    think("…俺がこれを使うのか？まあ…トメちゃん(現役JK)から見て俺が使って良いと思ったのならいいのか…？", "...I'm supposed to use this? Well... if Tome-chan (an actual high schooler) thinks it suits me, I guess that's fine...?", "surprise"),
    reigen("お、おう。ありがとうね。使わせてもらうよ", "Y-yeah. Thanks. I'll use it.", "smile"),
  ],
  ritsu: [
    say("律", "兄さんがいるところが貧乏くさいといけないので。あなたが使ってるの、割と安物でしょう", "I can't have the place my brother works looking shabby. The one you use is pretty cheap, isn't it?"),
    reigen("おー…", "Oh..."),
    think("たけーの買ってあるんだけど高すぎて怖くて使えてねえんだよな……これは学生が買える範囲のだけあってそこそこの良いものだ。ありがたく使わせてもらおう。", "I did buy an expensive one, but it's so pricey I'm too scared to use it... This one is within a student's budget, so it's decent quality. I'll gladly use it."),
    reigen("ありがとうな", "Thanks.", "smile"),
    say("律", "別に…アンタのためじゃないので", "It's... not for you or anything."),
    reigen("はいはい。", "Yeah, yeah."),
    think("こいつはいつになったら懐くんだ？", "When is this kid ever going to warm up to me?", "littlesad"),
  ],
  shou: [
    reigen("え…こ、これは…！！", "Wh-what... is this...!!", "surprise"),
    say("ショウ", "この前一緒にゲーセン行った時、頑張ってたけど取れてなかったろ？あとで俺もやってみたら取れたから持ってきたぜ！", "Remember when we went to the arcade? You tried so hard but couldn't win one. I tried it later and got it, so I brought it!"),
    reigen("ウ……犬の、ぬいぐるみ！！ありがとうな！！あっでも超能力は… ", "Uu... a dog plushie!! Thanks!! Wait, you didn't use your powers, did you...", "happy"),
    say("ショウ", "ハハハ、使ってねーよ！てか何回かで取れたぜ？", "Ha ha ha, no way! It only took me a few tries, too."),
    reigen("ぐぬぬ…", "Grrr...", "angry"),
    think("子供に負けるなんて…まあ逆に慣れてたら俺がやりまくってたみたいだしいいか。", "Losing to a kid... Well, if he'd been a pro, it'd look like I'd been playing way too much, so fine.", "littlesad"),
    say("ショウ", "あんまやったことないけどクレーンゲームって結構楽しいんだな！", "I haven't played much, but crane games are pretty fun!"),
    think("コイツ… …まあ、枕横にでも置いとくか…", "This kid... Well, I'll put it next to my pillow or something...", "smile"),
    reigen("ありがとうな", "Thanks.", "smile"),
  ],
  mob: [
    say("モブ", "よく考えたんですけどまともなのはこれしか思い浮かばなくて……他にバイトも始めてお金もあったので", "I thought hard, but this was the only sensible thing I could come up with... I also started a part-time job, so I had some money."),
    reigen("おぉ…！", "Oh...!", "surprise"),
    think("俺にモブのバイト代で？やばい泣きそうだ。このままずるずるバイトに来なくなりそうなことにも泣きそうだけど。", "With Mob's part-time pay? I might tear up. I might also tear up at the thought of him slowly drifting away from working here.", "littlesad"),
    say("モブ", "あの、本当はハゲモン柄を買おうと思ってたんですけど、", "Um, actually I was going to buy one with the Hagemon pattern, but..."),
    think("ギクッ！！", "Gulp!!", "surprise"),
    say("モブ", "人気で売り切れてたみたいで…", "It seemed to be sold out because it's so popular..."),
    reigen("そ、そうか…普通のネクタイでも、いやこっちの方が俺は割と嬉しいぞ", "I-I see... A plain necktie is fine, actually, I like this even better.", "smile"),
    say("モブ", "そうですか？へへ…気に入ってもらえて良かったです", "Really? Heh... I'm glad you like it."),
    reigen("ありがとうな", "Thanks.", "smile"),
  ],
  // エクボは2回に分かれる。1回目（このあとエクボは外へ出ていく）→ 扉の外で2回目（ekuboGift）
  ekubo: [
    say("エクボ", "あ？何だよ", "Huh? What?"),
    reigen("……", "..."),
    say("エクボ", "…何見てんだ！言っとくがお前にやれるもんは何一つねーからな！", "...What are you staring at! I'm telling you, I've got nothing to give you!"),
    reigen("……そーかよ", "...Fine, whatever.", "angry"),
    say("エクボ", "何拗ねてんだ、大体なんで俺様がやんなくちゃなんねえんだ…", "Why are you sulking? And why would I have to give you anything in the first place..."),
  ],
  teru: [
    say("テル", "迷ったんだけどね、この前茶葉が切れそうって言ってたから、僕のおすすめを持ってきたんだ。相談所の皆には良いものを飲んで欲しいからね☆", "I was torn, but you said you were running low on tea leaves the other day, so I brought my own recommendation. I want everyone at the agency to drink something good ☆"),
    reigen("お〜…", "Oh..."),
    think("なんか高そう。こういう時価値を分かってやれたら良かったんだが……昔顧客の人が好きで商談のために調べたこともあったが、さすがにもうほとんど覚えてないな", "Looks expensive. I wish I could appreciate its value at times like this... A client of mine used to love this stuff and I researched it once for a sales pitch, but I barely remember any of it now."),
    reigen("ありがとうな！使わせてもらうよ。やっぱりテルくんはこういうところセンスいいよな。", "Thanks! I'll use it. As expected, Teru-kun has great taste in this kind of thing.", "smile"),
    think("服以外は…", "Except for clothes..."),
    say("テル", "ふふ、本当は服と迷ったんだけど…", "Hehe, actually I was torn between this and clothes..."),
    think("ドキッ", "Gulp.", "surprise"),
    say("テル", "人それぞれ好みはあるかなって、一旦やめたんだ。", "I figured everyone has their own tastes, so I held off for now."),
    reigen("へ、へー！実は俺結構好み特殊だからあんま服は向いてないかもな！！でもありがとう気持ちだけありがたく受け取っとく", "R-right! Honestly my taste is pretty particular, so clothes might not suit me! But thanks, I'll gladly take the thought!", "surprise"),
    say("テル", "そうですか？欲しくなったらいつでも言ってくださいね", "Is that so? Tell me anytime if you ever want some."),
    reigen("ははは…そうだな…", "Ha ha... Right..."),
    think("悪いが声をかけるのはいつになるのやら…今度一緒に焼肉でも行ってうやむやにしよう…", "Sorry, but who knows when I'll ever ask... Let's go out for yakiniku sometime and brush it off..."),
  ],
  serizawa: [
    say("芹沢", "あの……ちょっと……やっぱりやめても……", "Um... well... maybe I should... forget it..."),
    reigen("ええー！何でだよ！！", "Whaat! Why!!", "surprise"),
    say("芹沢", "その……そういえば霊幻さんも付けてないなと思ったので…両親や店員さんにも相談したんですが、その、業務内容的には大丈夫なんでしょうか…", "Well... I realized you don't wear one either, Reigen-san... I asked my parents and the shop staff too, but, um, is it okay for the work we do...?"),
    reigen("は？", "Huh?", "angry"),
    say("芹沢", "ヒ", "Eek."),
    reigen("大丈夫に決まってんだろ！ありがとうな。", "Of course it's okay! Thanks.", "happy"),
    think("相談できるなんて成長したな…", "He asked people for advice. He's grown...", "smile"),
    say("芹沢", "ほっ………", "*Phew*......"),
    reigen("これからもし別の会社行ったとしても誰かに相談することは大事だからな、よく覚えとけよ", "Even if you end up at another company someday, asking someone for advice is important, so remember that."),
    say("芹沢", "……はあ、まあ……お誕生日、おめでとうございます", "......Well, sure... Happy birthday."),
  ],
};

// エクボの2回目（扉の外で、たこ焼きを押し付けてくる）
export const ekuboGiftLines = [
  say("エクボ", "たまたまコイツが持ってたから…", "I just happened to have it..."),
  think("こいつ顔赤くね？", "Isn't this guy's face red?"),
  think("これもまだアツアツじゃねーか。コイツ本当…", "And this is still piping hot. This guy, honestly..."),
  reigen("じゃあこれはプレゼントじゃないってことか？", "So this isn't a present, then?"),
  say("エクボ", "あ？まあそうなるな…", "Huh? Well... I guess so..."),
  reigen("え～、じゃあ今度プレゼント代わりに除霊付き合えよ。明後日の除霊は多分本物っぽいんだよな。", "Aww, then keep me company on an exorcism sometime as your present. The one the day after tomorrow seems like the real deal.", "happy"),
  say("エクボ", "は？んなこと言ってなかったじゃねえか、1人で行くつもりだったのかよ", "What? You never said that. Were you planning to go alone?"),
  reigen("やばかったら逃げるって。お前だって俺の逃げスキルは知ってるだろ？", "I'll run if it gets bad. You know my escape skills, right?"),
  say("エクボ", "お前さんなぁ………", "Boy, you......"),
  say("エクボ", "はぁ……誕生日に免じて見逃してやる。忘れて1人で行くなよ。", "Haah... I'll let it slide since it's your birthday. Don't forget and go alone."),
  reigen("はいはい。", "Yeah, yeah."),
  think("可愛い奴め…", "What a cutie...", "smile"),
];

// 調べたときの文章を、1画面に収まる長さに区切って地の文にする（英語は枠の中で自動に折り返すのでそのまま）
export function thinkLines(text, limit = 44) {
  if (isEnglish) {
    return [think(text, text)];
  }
  const sentences = text.match(/[^。？！]+[。？！]?/g) ?? [text];
  const chunks = [];
  for (const sentence of sentences) {
    const last = chunks.length - 1;
    if (last >= 0 && chunks[last].length + sentence.length <= limit) {
      chunks[last] += sentence;
    } else {
      chunks.push(sentence);
    }
  }
  return chunks.map((chunk) => think(chunk, chunk));
}

// プレゼントをもらったあとに話しかけたとき
export const afterGiftLines = {
  tome: [say("トメ", "お誕生日おめでとう！", "Happy birthday!")],
  ritsu: [say("律", "…お誕生日おめでとうございます", "...Happy birthday.")],
  shou: [say("ショウ", "誕生日おめでとうな！", "Happy birthday!")],
  mob: [say("モブ", "お誕生日おめでとうございます、師匠。", "Happy birthday, Master.")],
  teru: [say("テル", "お誕生日おめでとうございます！", "Happy birthday!")],
  serizawa: [say("芹沢", "お誕生日おめでとうございます", "Happy birthday.")],
};

// エクボ：1回目のあとに話しかけたとき（まだ近くにいる）
export const ekuboWaitingLines = [say("エクボ", "………", "......")];

// エクボ：玄関から戻ってきたあと。話しかけるたびに次へ進み、最後は繰り返す
export const ekuboAfterLines = [
  [say("エクボ", "……なんだよ、もう本当になんもねえぞ", "...What, I really have nothing else for you.")],
  [say("エクボ", "しつけえな", "You're persistent.")],
  [say("エクボ", "………", "......")],
  [say("エクボ", "……おめっとさん", "...Happy birthday, I guess.")],
];

// ライブラリ・コレクション用の情報。episode＝霊の思い・エピソード、meaning＝プレゼントの意味（薄字）
export const GIFT_INFO = {
  tome: {
    gift: t("ハンカチ", "Handkerchief"),
    note: t("可愛いリボンが縫い付けられている。", "A cute ribbon is sewn on."),
    episode: t("ずっとしまっていたウーのためのリボンと似た柄だ。かなり嬉しい。……ちょっと寂しさもあるが。", "The pattern looks like the ribbon I'd kept for Uu. I'm really happy. ...A little lonely, too."),
    meaning: "",
  },
  ritsu: {
    gift: t("質の良さそうなボールペン", "Fancy-looking ballpoint pen"),
    note: t("某有名文房具屋のロゴが入っている。", "It has the logo of a famous stationery shop."),
    episode: t("ほんと素直じゃないよな。……ちょっと反抗期なだけだよな？言ってること本当じゃないよな？", "He really isn't honest. ...He's just in a bit of a rebellious phase, right? He doesn't really mean what he says, right?"),
    meaning: t("ボールペンのプレゼント：「あなたを独占したい」「いつも私を思い出して」", "Gift of a pen: \"I want you all to myself\" / \"Think of me always\""),
  },
  shou: {
    gift: t("犬のぬいぐるみ", "Dog plushie"),
    note: t("ウーに似たデザインだ。", "Its design looks like Uu."),
    episode: t("ショウくんとはこの前町でばったり出会って、そのままゲーセンで少し遊んだんだよな。結構悔しかったから嬉しいな。", "I ran into Shou in town the other day and we ended up playing at the arcade for a bit. I was pretty frustrated back then, so this makes me happy."),
    meaning: t("ぬいぐるみのプレゼント：「親密な関係になりたい」", "Gift of a stuffed toy: \"I want a closer relationship\""),
  },
  mob: {
    gift: t("ネクタイ", "Necktie"),
    note: t("少し深みのある落ち着いたネイビーだ。", "A calm, slightly deep navy."),
    episode: t("………成長を感じると毎回泣きそうになるんだよな。", "......Every time I see him grow, I nearly cry."),
    meaning: t("ネクタイのプレゼント：「あなたに首ったけ」「あなたを束縛したい」", "Gift of a necktie: \"I'm head over heels for you\" / \"I want to bind you\""),
  },
  ekubo: {
    gift: t("たこ焼き", "Takoyaki"),
    note: t("よく行く近くのたこ焼き屋のもの。まだアツアツだ。", "From the takoyaki shop he often goes to nearby. Still piping hot."),
    episode: t("中に何か入っている。……シロツメクサの花束のようだ。器用に茎で結ばれている。……アイツは本当に悪霊か？結局プレゼントな気満々じゃねーか", "There's something inside. ...It looks like a bouquet of white clover. Neatly tied together with the stems. ...Is that guy really an evil spirit? He clearly meant this as a present."),
    meaning: t("シロツメクサの花言葉：「幸福」「約束」「私を思って」", "Language of flowers for white clover: \"Happiness\", \"Promise\", \"Think of me\""),
  },
  teru: {
    gift: t("高級茶葉・ハーブティー詰め合わせ", "Premium tea & herbal tea set"),
    note: t("いろんな味があるようだ。", "There seem to be lots of flavors."),
    episode: t("どこの店のものだろう。あとで飲みながら調べてみよう。", "I wonder which shop it's from. I'll look it up while drinking some later."),
    meaning: t("ハーブティーのプレゼント：「心を癒したい」「あなたと時間を共有したい」", "Gift of herbal tea: \"I want to soothe your heart\" / \"I want to share time with you\""),
  },
  serizawa: {
    gift: t("ネクタイピン", "Tie clip"),
    note: t("銀色の、シックなデザインだ。", "Silver, with a chic, understated design."),
    episode: t("よく見たら芹沢も同じようなデザインのネクタイピンを新しく付けている。………思ったより慕われてるって思っていいのか？", "Looking closely, Serizawa is wearing a similar new tie clip too. ......Can I take it that he looks up to me more than I thought?"),
    meaning: t("ネクタイピンのプレゼント：「あなたを支えたい」「そばで見守りたい」", "Gift of a tie clip: \"I want to support you\" / \"I want to watch over you\""),
  },
};

// ---- 夜のシーン（1人で残る）。文面は仮。台詞の差し替えはここ ----
export const nightIntroLines = [
  think("……さて、片付けるか。", "......Well then, time to clean up.", "alone"),
  think("さっきまであんなに騒がしかったのに、嘘みたいに静かだな。", "It was so noisy just a while ago, and now it's unbelievably quiet.", "alone"),
  think("プレゼントに、散らかったゴミに、紙吹雪。……楽しかったな。", "Presents, scattered trash, confetti. ...That was fun.", "happy"),
  think("でも、こんな日がずっと続くわけじゃない。みんな、いつかは離れていく。", "But days like this don't last forever. Everyone leaves someday.", "alone"),
  think("……わかってるさ、そんなことは。", "......I know that. I do.", "alone"),
];

export const nightDeskLines = [
  think("机の上に、みんなで撮った写真が置いてあった。", "A photo we all took together was sitting on the desk.", "alone"),
  think("……生まれてきて、よかったな。", "......I'm glad I was born.", "happy"),
  think("でも、やっぱり、ちょっと寂しいな。", "But still, it's a little lonely.", "littlesad"),
  think("いつか離れていくまでは、大事にしよう。", "Until the day they leave, I'll cherish this.", "happy"),
];

export const nightSafeNoMemoLines = [
  think("書類の下に金庫がある。……が、番号がわからない。", "There's a safe under the papers. ...But I don't know the combination."),
  think("どこかにメモを残したはずなんだが。", "I'm sure I left a memo somewhere."),
];

export const nightSafeOpenLines = [
  think("メモの番号で、金庫が開いた。", "The combination from the memo opened the safe."),
  think("みんなで撮った写真を、そっとしまう。", "I gently put the photo we all took inside."),
  think("……今年は、いい誕生日だったな。", "......It was a good birthday this year.", "happyend"),
];

export const nightDoorLines = [think("今夜は、もう少しここにいよう。", "I think I'll stay here a little longer tonight.")];
