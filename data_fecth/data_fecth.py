import pandas as pd
import json
import os

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

def clean_value(val):
    if pd.isna(val):
        return 0.0
    try:
        return float(val)
    except:
        return 0.0

def process_split_files(weekday_file, holiday_file, out_file, var_name):
    print(f"処理中 (平日+休日): {os.path.basename(weekday_file)} & {os.path.basename(holiday_file)} -> {os.path.basename(out_file)}")
    holiday_xls = pd.ExcelFile(holiday_file)
    weekday_xls = pd.ExcelFile(weekday_file)
    
    travelData = []
    
    for sheet in holiday_xls.sheet_names:
        if sheet not in weekday_xls.sheet_names:
            continue
        holiday_df = pd.read_excel(holiday_file, sheet_name=sheet, header=None)
        weekday_df = pd.read_excel(weekday_file, sheet_name=sheet, header=None)
        
        purpose = sheet
        destinations = holiday_df.iloc[8, 2:52]
        
        for row in range(9, 59):
            origin = holiday_df.iloc[row, 1]
            if pd.isna(origin):
                continue
            
            for col in range(2, 52):
                destination = destinations.iloc[col - 2]
                if pd.isna(destination):
                    continue
                
                holiday_val = clean_value(holiday_df.iloc[row, col])
                weekday_val = clean_value(weekday_df.iloc[row, col])
                
                # 年間換算計算式: (平日1日 * 245日) + (休日1日 * 120日)
                annual_people = int(round(weekday_val * 245 + holiday_val * 120))
                
                if annual_people <= 0:
                    continue
                
                travelData.append({
                    "from": str(origin),
                    "to": str(destination),
                    "people": annual_people,
                    "purpose": str(purpose),
                    "fromCoord": coords.get(str(origin)),
                    "toCoord": coords.get(str(destination))
                })
                
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(f"export const {var_name} = " + json.dumps(travelData, ensure_ascii=False, indent=2) + ";\n")
    print(f"  -> 生成完了: {os.path.basename(out_file)} ({len(travelData)} 件)")

def process_single_file(single_file, out_file, var_name):
    print(f"処理中 (単一1日): {os.path.basename(single_file)} -> {os.path.basename(out_file)}")
    xls = pd.ExcelFile(single_file)
    travelData = []
    
    for sheet in xls.sheet_names:
        df = pd.read_excel(single_file, sheet_name=sheet, header=None)
        purpose = sheet
        destinations = df.iloc[8, 2:52]
        
        for row in range(9, 59):
            origin = df.iloc[row, 1]
            if pd.isna(origin):
                continue
            
            for col in range(2, 52):
                destination = destinations.iloc[col - 2]
                if pd.isna(destination):
                    continue
                
                single_val = clean_value(df.iloc[row, col])
                
                # 年間換算計算式: 1日 * 365日
                annual_people = int(round(single_val * 365))
                
                if annual_people <= 0:
                    continue
                
                travelData.append({
                    "from": str(origin),
                    "to": str(destination),
                    "people": annual_people,
                    "purpose": str(purpose),
                    "fromCoord": coords.get(str(origin)),
                    "toCoord": coords.get(str(destination))
                })
                
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(f"export const {var_name} = " + json.dumps(travelData, ensure_ascii=False, indent=2) + ";\n")
    print(f"  -> 生成完了: {os.path.basename(out_file)} ({len(travelData)} 件)")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(base_dir)
    src_dir = os.path.join(root_dir, "src")
    
    configs = [
        # 1990年度
        {
            "year": "1990",
            "purpose": {
                "type": "single",
                "file": os.path.join(base_dir, "1990年度", "000991446.xls"),
                "out": os.path.join(src_dir, "PurposeTravel1990.jsx"),
                "var_name": "travelData1990"
            },
            "transportation": {
                "type": "single",
                "file": os.path.join(base_dir, "1990年度", "000991372.xls"),
                "out": os.path.join(src_dir, "TransportationTravel1990.jsx"),
                "var_name": "transportationData1990"
            }
        },
        # 1995年度
        {
            "year": "1995",
            "purpose": {
                "type": "single",
                "file": os.path.join(base_dir, "1995年度", "000991447.xls"),
                "out": os.path.join(src_dir, "PurposeTravel1995.jsx"),
                "var_name": "travelData1995"
            },
            "transportation": {
                "type": "single",
                "file": os.path.join(base_dir, "1995年度", "000991398.xls"),
                "out": os.path.join(src_dir, "TransportationTravel1995.jsx"),
                "var_name": "transportationData1995"
            }
        },
        # 2000年度
        {
            "year": "2000",
            "purpose": {
                "type": "single",
                "file": os.path.join(base_dir, "2000年度", "000991448.xls"),
                "out": os.path.join(src_dir, "PurposeTravel2000.jsx"),
                "var_name": "travelData2000"
            },
            "transportation": {
                "type": "single",
                "file": os.path.join(base_dir, "2000年度", "000991403.xls"),
                "out": os.path.join(src_dir, "TransportationTravel2000.jsx"),
                "var_name": "trasnportationData2000"
            }
        },
        # 2005年度
        {
            "year": "2005",
            "purpose": {
                "type": "split",
                "weekday_file": os.path.join(base_dir, "2005年度", "000991450.xls"),
                "holiday_file": os.path.join(base_dir, "2005年度", "000991449.xls"),
                "out": os.path.join(src_dir, "PurposeTravel2005.jsx"),
                "var_name": "travelData2005"
            },
            "transportation": {
                "type": "single",
                "file": os.path.join(base_dir, "2005年度", "000991408.xls"),
                "out": os.path.join(src_dir, "TransportationTravel2005.jsx"),
                "var_name": "transportationData2005"
            }
        },
        # 2010年度
        {
            "year": "2010",
            "purpose": {
                "type": "split",
                "weekday_file": os.path.join(base_dir, "2010年度", "000991452.xls"),
                "holiday_file": os.path.join(base_dir, "2010年度", "000991451.xls"),
                "out": os.path.join(src_dir, "PurposeTravel2010.jsx"),
                "var_name": "travelData2010"
            },
            "transportation": {
                "type": "single",
                "file": os.path.join(base_dir, "2010年度", "000994606.xls"),
                "out": os.path.join(src_dir, "TransportationTravel2010.jsx"),
                "var_name": "transportationData2010"
            }
        }
    ]

    print("=== 全国幹線旅客純流動調査 年間換算データ一括生成開始 ===")
    for cfg in configs:
        print(f"\n--- {cfg['year']}年度 ---")
        # 目的別
        p = cfg["purpose"]
        if p["type"] == "split":
            process_split_files(p["weekday_file"], p["holiday_file"], p["out"], p["var_name"])
        else:
            process_single_file(p["file"], p["out"], p["var_name"])
        
        # 交通手段別
        t = cfg["transportation"]
        if t["type"] == "split":
            process_split_files(t["weekday_file"], t["holiday_file"], t["out"], t["var_name"])
        else:
            process_single_file(t["file"], t["out"], t["var_name"])
            
    print("\n=== 全年度の年間換算データ生成が完了しました ===")

if __name__ == "__main__":
    main()