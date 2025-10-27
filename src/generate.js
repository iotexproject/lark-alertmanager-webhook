import _ from "lodash";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import updateLocale from "dayjs/plugin/updateLocale.js";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(utc);
dayjs.extend(updateLocale);
dayjs.extend(relativeTime);

const formatTime = (time) => {
  const day = dayjs(time).utcOffset(8);
  return day.format("YYYY-MM-DD HH:mm:ss CST");
};

export default (alert, { withActions = false } = {}) => {
  const {
    status,
    labels: { alertname, severity, prometheus, ...labels },
    annotations: { description, runbook_url },
    startsAt,
    endsAt,
    generatorURL,
    externalURL,
  } = alert;
  return {
    config: {
      wide_screen_mode: true,
    },
    header: {
      template:
        status === "resolved"
          ? "green"
          : {
              critical: "red",
              warning: "yellow",
              info: "blue",
            }[severity] ?? "",
      title: {
        content: `${
          status === "resolved"
            ? "✅ Resolved"
            : {
                critical: "🚨 Critical",
                warning: "⚠️ Warning",
                info: "ℹ️ Info",
              }[severity]
        }: ${alertname}`,
        tag: "plain_text",
      },
    },
    elements: [
      {
        fields: [
          {
            is_short: true,
            text: {
              content:
                status === "resolved"
                  ? `**🕐 EndsAt：**\n${formatTime(endsAt)}`
                  : `**🕐 StartsAt：**\n${formatTime(startsAt)}`,
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `**🏷️ EventType：**\n${alertname}`,
              tag: "lark_md",
            },
          },
          {
            is_short: false,
            text: {
              content: "",
              tag: "lark_md",
            },
          },
          {
            is_short: false,
            text: {
              content: `**📝 Description: **\n${description}`,
              tag: "lark_md",
            },
          }
        ],
        tag: "div",
      },
      _.toPairs(labels).length > 0 && {
        tag: "hr",
      },
      _.toPairs(labels).length > 0 && {
        tag: "markdown",
        content: _.toPairs(labels)
          .map(([key, value]) => `**${key}:** ${value}`)
          .join("\n"),
      },
      {
        tag: "markdown",
        content: [
          `🚨 [alertmanager](${externalURL})`,
          generatorURL && `🔗 [prometheus](${generatorURL})`,
          runbook_url && `📒 [runbook](${runbook_url})`,
        ]
          .filter(Boolean)
          .join(" | "),
      },
      withActions &&
        status !== "resolved" && {
          actions: [
            {
              options: [
                {
                  text: {
                    content: "Inhibit 30mins",
                    tag: "plain_text",
                  },
                  value: "time_30m",
                },
                {
                  text: {
                    content: "Inhibit 1h",
                    tag: "plain_text",
                  },
                  value: "time_1h",
                },
                {
                  text: {
                    content: "Inhibit 4h",
                    tag: "plain_text",
                  },
                  value: "time_4h",
                },
                {
                  text: {
                    content: "Inhibit 24h",
                    tag: "plain_text",
                  },
                  value: "time_24h",
                },
              ],
              placeholder: {
                content: "Inhibit Temporary",
                tag: "plain_text",
              },
              tag: "select_static",
              value: {
                alert: JSON.stringify(alert),
              },
            },
          ],
          tag: "action",
        },
    ].filter(Boolean),
  };
};
