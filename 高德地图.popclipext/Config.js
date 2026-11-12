// #popclip
// name: 高德地图
// identifier: com.lessismore.popclip.amap
// description: 选中地址时用高德地图搜索。
// icon: preserve-color file:icon.png
// entitlements: [dynamic]
// language: javascript
// module: true

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

exports.actions = (input) => {
  const text = cleanText(input.text);
  if (!text || !looksLikeAddress(text)) return [];
  return [
    {
      title: "高德地图",
      code: () =>
        popclip.openUrl("https://www.amap.com/ssr/search?query=" + encodeURIComponent(text)),
    },
  ];
};
