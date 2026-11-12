// #popclip
// name: BOSS直聘
// identifier: com.lessismore.popclip.boss
// description: 选中公司名时用 BOSS直聘搜索。
// icon: preserve-color file:icon.png
// entitlements: [dynamic]
// language: javascript
// module: true

const COMPANY_SUFFIX_RE =
  /(?:有限责任公司|股份有限公司|有限公司|集团|公司|企业|工作室|事务所|合伙企业|个体工商户|合作社|研究院|研究所|银行|保险|证券|基金|大学|医院|厂|店|商行|经营部)/;

const COMPANY_KEYWORDS_RE =
  /(?:科技|网络|信息|文化|传媒|贸易|商贸|咨询|实业|投资|控股|资本|资产管理|教育|医疗|生物|医药|能源|环保|建筑|地产|置业|物流|供应链|餐饮|酒店|旅游|娱乐|影视|游戏|电子商务|软件|数据|智能|机器人|汽车|电子|半导体|新材料|化工|机械|制造)/g;

const COMPANY_ALIASES = new Set([
  "字节跳动",
  "阿里巴巴",
  "腾讯",
  "美团",
  "京东",
  "小米",
  "华为",
  "百度",
  "网易",
  "滴滴",
  "拼多多",
  "快手",
  "小红书",
  "哔哩哔哩",
  "知乎",
  "理想汽车",
  "蔚来",
  "小鹏汽车",
  "比亚迪",
  "宁德时代",
  "大疆",
  "商汤",
  "旷视",
  "月之暗面",
  "智谱",
  "MiniMax",
  "深度求索",
  "泡泡玛特",
  "名创优品",
  "瑞幸咖啡",
  "蜜雪冰城",
]);

const PLACE_ONLY_RE =
  /^(?:北京|上海|天津|重庆|河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|台湾|内蒙古|广西|西藏|宁夏|新疆|香港|澳门|杭州|深圳|广州|成都|武汉|南京|苏州|西安|长沙|郑州|青岛|宁波|厦门|福州|济南|合肥|昆明|大连|沈阳|哈尔滨|长春|石家庄|太原|南昌|贵阳|南宁|海口|兰州|西宁|银川|乌鲁木齐|拉萨|呼和浩特)(?:省|市|自治区|特别行政区)?$/;

const PLACE_PREFIX_RE =
  /^(?:北京|上海|天津|重庆|河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|台湾|内蒙古|广西|西藏|宁夏|新疆|香港|澳门|杭州|深圳|广州|成都|武汉|南京|苏州|西安|长沙|郑州|青岛|宁波|厦门|福州|济南|合肥|昆明|大连|沈阳|哈尔滨|长春|石家庄|太原|南昌|贵阳|南宁|海口|兰州|西宁|银川|乌鲁木齐|拉萨|呼和浩特)(?:市|省|自治区|特别行政区)?[^。！？!?；;]{1,30}(?:区|县|镇|乡|街道|路|街|巷|弄|号|栋|幢|楼|室)/;

function cleanText(raw) {
  return String(raw || "")
    .replace(
      /^(?:公司地址|企业地址|地址|地点|位置|公司名称|企业名称|公司|企业|单位)[：:]\s*/,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeAddress(text) {
  if (PLACE_ONLY_RE.test(text)) return true;
  if (text.length < 4 || text.length > 120) return false;
  if (!/[\u4e00-\u9fa5A-Za-z]/.test(text)) return false;
  if (/^[\d\s\-+()（）]+$/.test(text)) return false;
  if (PLACE_PREFIX_RE.test(text)) return true;

  const hasProvince = /(?:省|自治区|特别行政区)/.test(text);
  const hasCity = /(?:市|自治州|地区|盟)/.test(text);
  const hasDistrict = /(?:区|县|旗)/.test(text);
  const hasTown = /(?:镇|乡|街道|社区|村)/.test(text);
  const hasRoad = /(?:路|街|巷|弄|大道|大街|胡同)/.test(text);
  const hasNumber = /[0-9０-９一二三四五六七八九十百千万]/.test(text);
  const hasBuilding = /(?:号|栋|幢|座|楼|单元|室)/.test(text);
  const hasPlace = /(?:大厦|广场|小区|园区|花园|公寓|中心|写字楼|商厦|城)/.test(text);

  return [
    hasProvince && hasCity,
    hasCity && hasDistrict,
    hasDistrict && hasRoad,
    hasRoad && hasNumber,
    hasNumber && hasBuilding,
    hasTown && (hasRoad || hasBuilding),
    hasPlace && (hasRoad || hasNumber || hasBuilding),
  ].some(Boolean);
}

function looksLikeCompany(text) {
  if (text.length < 2 || text.length > 80) return false;
  if (!/[\u4e00-\u9fa5A-Za-z]/.test(text)) return false;
  if (/[。！？!?；;，,、]/.test(text)) return false;
  if (COMPANY_ALIASES.has(text)) return true;
  if (COMPANY_SUFFIX_RE.test(text)) return true;

  const keywordCount = (text.match(COMPANY_KEYWORDS_RE) || []).length;
  return (
    keywordCount >= 2 &&
    text.length <= 30 &&
    !looksLikeAddress(text) &&
    !/(?:园|区|城|街|路|楼|中心|广场|大厦|小区)$/.test(text)
  );
}


exports.actions = (input) => {
  const text = cleanText(input.text);
  if (!text || !looksLikeCompany(text)) return [];
  return [
    {
      title: "BOSS直聘",
      code: () =>
        popclip.openUrl(
          "https://www.zhipin.com/job_detail/?query=" +
            encodeURIComponent(text) +
            "&city=100010000&industry=&position=",
        ),
    },
  ];
};
