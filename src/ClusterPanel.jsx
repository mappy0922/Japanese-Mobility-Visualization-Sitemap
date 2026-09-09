import React from "react";
import {
  getPrefectureCluster,
  getPrefecturesInCluster,
} from "./clusterData";

export default function ClusterPanel({
  destination = "大阪",
  setDestination,
  prefecture = "東京",
}) {
  const profile = getPrefectureCluster(destination);
  const cluster = profile.cluster;
  const sameClusterPrefs = getPrefecturesInCluster(cluster.id);

  return (
    <div className="compareCard clusterPanelCard">
      {/* ヘッダー行 */}
      <div className="compareHeaderTopRow">
        <div className="clusterHeaderLeft">
          <span className="compareTitle">地域特性・クラスタ分析</span>
        </div>
        <span className="clusterTargetName">{destination} の地域特性</span>
      </div>

      {/* クラスタ名バッジ & 概要 */}
      <div
        className="clusterHeroBadge"
        style={{
          background: cluster.bgColor,
          borderColor: cluster.borderColor,
          color: cluster.color,
        }}
      >
        <span className="clusterIcon">{cluster.icon}</span>
        <div className="clusterBadgeText">
          <span className="clusterTypeName">{cluster.name}</span>
          <span className="clusterEnName">{cluster.enName}</span>
        </div>
      </div>

      <p className="clusterSummaryText">{cluster.summary}</p>

      {/* 主な移動特徴（出発地 × 目的 × 手段） */}
      <div className="clusterFeatureSection">
        <div className="clusterSectionTitle">主な移動特徴と要因</div>
        <ul className="clusterFeatureList">
          {profile.features.map((feature, idx) => (
            <li key={idx} className="clusterFeatureItem">
              <span
                className="clusterBullet"
                style={{ background: cluster.color }}
              />
              <span className="clusterFeatureText">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 移動プロファイル指標 (4軸ミニバー) */}
      <div className="clusterMetricsSection">
        <div className="clusterSectionTitle">移動プロファイル指標</div>
        <div className="clusterMetricsGrid">
          <div className="metricItem">
            <div className="metricLabelRow">
              <span className="metricName">観光度</span>
              <span className="metricValue">{profile.scores.tourism}%</span>
            </div>
            <div className="metricTrack">
              <div
                className="metricFill"
                style={{
                  width: `${profile.scores.tourism}%`,
                  background: "#0284c7",
                }}
              />
            </div>
          </div>

          <div className="metricItem">
            <div className="metricLabelRow">
              <span className="metricName">業務・出張度</span>
              <span className="metricValue">{profile.scores.business}%</span>
            </div>
            <div className="metricTrack">
              <div
                className="metricFill"
                style={{
                  width: `${profile.scores.business}%`,
                  background: "#ea580c",
                }}
              />
            </div>
          </div>

          <div className="metricItem">
            <div className="metricLabelRow">
              <span className="metricName">鉄道利用率</span>
              <span className="metricValue">{profile.scores.rail}%</span>
            </div>
            <div className="metricTrack">
              <div
                className="metricFill"
                style={{
                  width: `${profile.scores.rail}%`,
                  background: "#8b5cf6",
                }}
              />
            </div>
          </div>

          <div className="metricItem">
            <div className="metricLabelRow">
              <span className="metricName">遠距離流入比率</span>
              <span className="metricValue">{profile.scores.longDist}%</span>
            </div>
            <div className="metricTrack">
              <div
                className="metricFill"
                style={{
                  width: `${profile.scores.longDist}%`,
                  background: "#059669",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 同じクラスタに属する地域タグ */}
      <div className="sameClusterSection">
        <div className="clusterSectionTitle">
          <span>同じ「{cluster.shortName}」の地域</span>
          <span className="sameClusterCount">({sameClusterPrefs.length}地点)</span>
        </div>
        <div className="sameClusterTagList">
          {sameClusterPrefs.map((pref) => {
            const isSelected = pref === destination;
            return (
              <button
                key={pref}
                type="button"
                className={`sameClusterTag ${isSelected ? "active" : ""}`}
                style={
                  isSelected
                    ? {
                        background: cluster.color,
                        borderColor: cluster.color,
                        color: "#fff",
                      }
                    : {}
                }
                onClick={() => {
                  if (setDestination) {
                    setDestination(pref);
                  }
                }}
                title={`${pref}のデータを見る`}
              >
                {pref}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
