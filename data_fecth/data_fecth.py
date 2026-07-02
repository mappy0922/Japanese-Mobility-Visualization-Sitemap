import pandas as pd
import json

# =========================
# 地域名 → [経度, 緯度]
# =========================
coords = {
    "道北": [142.4, 44.9],
    "道東": [144.3, 43.5],
    "道央": [141.7, 43.2],
    "道南": [140.7, 41.8],

    "青森": [140.74, 40.82],
    "岩手": [141.15, 39.70],
    "宮城": [140.87, 38.27],
    "秋田": [140.10, 39.72],
    "山形": [140.36, 38.24],
    "福島": [140.47, 37.75],

    "茨城": [140.47, 36.37],
    "栃木": [139.88, 36.56],
    "群馬": [139.06, 36.39],
    "埼玉": [139.65, 35.86],
    "千葉": [140.12, 35.61],
    "東京": [139.7671, 35.6812],
    "神奈川": [139.64, 35.45],

    "新潟": [139.04, 37.92],
    "富山": [137.21, 36.70],
    "石川": [136.65, 36.56],
    "福井": [136.22, 36.06],

    "山梨": [138.57, 35.66],
    "長野": [138.18, 36.65],
    "岐阜": [136.76, 35.42],
    "静岡": [138.38, 34.97],
    "愛知": [136.91, 35.18],

    "三重": [136.51, 34.73],
    "滋賀": [135.87, 35.00],
    "京都": [135.7681, 35.0116],
    "大阪": [135.5023, 34.6937],
    "兵庫": [135.18, 34.69],
    "奈良": [135.80, 34.68],
    "和歌山": [135.17, 34.23],

    "鳥取": [134.24, 35.50],
    "島根": [132.75, 35.47],
    "岡山": [133.93, 34.66],
    "広島": [132.46, 34.39],
    "山口": [131.47, 34.19],

    "徳島": [134.56, 34.07],
    "香川": [134.04, 34.34],
    "愛媛": [132.77, 33.84],
    "高知": [133.53, 33.56],

    "福岡": [130.40, 33.59],
    "佐賀": [130.30, 33.26],
    "長崎": [129.87, 32.75],
    "熊本": [130.71, 32.80],
    "大分": [131.61, 33.24],
    "宮崎": [131.42, 31.91],
    "鹿児島": [130.56, 31.60],

    "沖縄": [127.68, 26.21]
}

# =========================
# Excelファイル
# =========================
"""
holiday_file = "./data_fecth/2010年度/000991451.xls"
weekday_file = "./data_fecth/2010年度/000991452.xls"

travelData = []

holiday_xls = pd.ExcelFile(holiday_file)
weekday_xls = pd.ExcelFile(weekday_file)

# =========================
# 全シート処理
# =========================
for sheet in holiday_xls.sheet_names:

    holiday_df = pd.read_excel(
        holiday_file,
        sheet_name=sheet,
        header=None
    )

    weekday_df = pd.read_excel(
        weekday_file,
        sheet_name=sheet,
        header=None
    )

    purpose = sheet

    # 目的地一覧
    destinations = holiday_df.iloc[8, 2:52]

    # 出発地一覧
    for row in range(9, 59):

        origin = holiday_df.iloc[row, 1]

        if pd.isna(origin):
            continue

        for col in range(2, 52):

            destination = destinations.iloc[col - 2]

            if pd.isna(destination):
                continue

            holiday_people = holiday_df.iloc[row, col]
            weekday_people = weekday_df.iloc[row, col]

            try:
                holiday_people = int(float(holiday_people))
            except:
                holiday_people = 0

            try:
                weekday_people = int(float(weekday_people))
            except:
                weekday_people = 0

            people = holiday_people + weekday_people

            if people <= 0:
                continue

            travelData.append({
                "from": str(origin),
                "to": str(destination),
                "people": people,
                "purpose": purpose,

                # 経度・緯度追加
                "fromCoord": coords.get(str(origin)),
                "toCoord": coords.get(str(destination))
            })

# =========================
# JSファイル出力
# =========================
with open(
    "travelData.js",
    "w",
    encoding="utf-8"
) as f:

    f.write(
        "export const travelData = "
        + json.dumps(
            travelData,
            ensure_ascii=False,
            indent=2
        )
        + ";"
    )

print("件数:", len(travelData))
print("travelData.js を生成しました")
"""

traffic_file = "./data_fecth/2000年度/000991448.xls"

travelData = []

traffic_xls = pd.ExcelFile(traffic_file)

# =========================
# 全シート処理
# =========================
for sheet in traffic_xls.sheet_names:

    traffic_df = pd.read_excel(
        traffic_file,
        sheet_name=sheet,
        header=None
    )

    purpose = sheet

    # 目的地一覧
    destinations = traffic_df.iloc[7, 2:52]

    # 出発地一覧
    for row in range(8, 58):

        origin = traffic_df.iloc[row, 1]

        if pd.isna(origin):
            continue

        for col in range(2, 52):

            destination = destinations.iloc[col - 2]

            if pd.isna(destination):
                continue

            traffic_people = traffic_df.iloc[row, col]

            try:
                traffic_people = int(float(traffic_people))
            except:
                traffic_people = 0

            people = traffic_people

            if people <= 0:
                continue

            travelData.append({
                "from": str(origin),
                "to": str(destination),
                "people": people,
                "purpose": purpose,

                # 経度・緯度追加
                "fromCoord": coords.get(str(origin)),
                "toCoord": coords.get(str(destination))
            })

# =========================
# JSファイル出力
# =========================
with open(
    "travelData.js",
    "w",
    encoding="utf-8"
) as f:

    f.write(
        "export const travelData = "
        + json.dumps(
            travelData,
            ensure_ascii=False,
            indent=2
        )
        + ";"
    )

print("件数:", len(travelData))
print("travelData.js を生成しました")