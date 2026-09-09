import React from "react";
import { getPrefectureCluster } from "./clusterData";

export default function ClusterPanel({
  destination = "大阪",
  setDestination,
  prefecture = "東京",
}) {
  const profile = getPrefectureCluster(destination);
  const cluster = profile.cluster;

  const metricList = [
    { name: "観光交流度", value: profile.scores.tourism },
    { name: "産業・業務度", value: profile.scores.business },
    { name: "鉄道分担率", value: profile.scores.rail },
    { name: "広域流入比率", value: profile.scores.longDist },
  ];

  return (
    <div className="compareCard clusterPanelCard">
      {/* 1. ヘッダー行 (compareCard共通フォーマット) */}
      <div className="compareHeaderTopRow">
        <span className="compareTitle">地域特性・クラスタ分析</span>
        <span className="compareFlowBadge">対象地域: {destination}</span>
      </div>

      {/* 2. クラスタ分類名 */}
      <div
        className="clusterClassificationBox"
        style={{
          borderLeftColor: cluster.color,
          background: cluster.bgColor,
        }}
      >
        <div className="clusterTypeHeader">
          <span className="clusterTypeTag" style={{ color: cluster.color }}>
            分類
          </span>
          <span className="clusterTypeName" style={{ color: cluster.color }}>
            {cluster.name}
          </span>
        </div>
      </div>

      {/* 3. 主な移動特徴と要因 (SvgLabel準拠の見出しとリスト) */}
      <div className="clusterSectionWrapper">
        <div className="clusterSectionHeader">
          <span className="clusterSectionTitle">主な移動特徴と要因</span>
          <span className="clusterSectionSub">流動特性</span>
        </div>
        <div className="clusterFeatureList">
          {profile.features.map((feature, idx) => (
            <div key={idx} className="clusterFeatureItem">
              <span
                className="clusterBullet"
                style={{ background: cluster.color }}
              />
              <span className="clusterFeatureText">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 移動プロファイル指標 (SvgLabelの割合ゲージと完全一致のスタイル) */}
      <div className="clusterSectionWrapper">
        <div className="clusterSectionHeader">
          <span className="clusterSectionTitle">移動プロファイル指標</span>
          <span className="clusterSectionSub">推計スコア</span>
        </div>
        <div className="clusterMetricsContainer">
          {metricList.map((metric) => (
            <div key={metric.name} className="clusterMetricRow">
              <div className="clusterMetricLabelLine">
                <span className="clusterMetricName">{metric.name}</span>
                <span className="clusterMetricValue">{metric.value}%</span>
              </div>
              <div className="clusterMetricTrack">
                <div
                  className="clusterMetricFill"
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
