// Components/RouterContent.js
"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import { CallApi } from "@/API/CallApi/CallApi";
import { getClientIpAddress } from "@/Utils/globalFunc";
import axios from "axios";
import sampleData from './GetPageIdData.json';

const GridMain = lazy(() => import("@/Components/GridMain"));
const ReportListPage = lazy(() =>
  import("@/Components/Pages/ReportListPage/ReportListPage")
);

export default function RouterContent() {
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const CN = searchParams.get("CN");
  const newToken = searchParams.get("Token");

  const [tokenMissing, setTokenMissing] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [spNumber, setSpNumber] = useState(null);
  const [largeData, setLargeData] = useState(false);
  const [dateOptionsShow, setLargeDataShow] = useState(false);
  const [spliterReportShow, setSpliterReportShow] = useState(false);
  const [isFormulaBasedSummary, setIsFormulaBasedSummary] = useState(false);
  const [spliterReportFirstPanel, setSpliterReportFirstPanel] = useState();
  const [spliterReportFirstPanelFilter, setSpliterReportFirstPanelFilter] = useState();
  const [spliterReportSecondPanelSecondoption, setSpliterReportSecondPanelSecondoption] = useState();
  const [spliterReportFirstPanelShowAll, setSpliterReportFirstPanelShowAll] = useState();
  const [spliterReportSecondPanelShowAll, setSpliterReportSecondPanelShowAll] = useState();
  const [spliterReportAllDataButton, setSpliterReportAllDataButton] = useState();
  const [otherPrintOptionShow, setOtherPrintOptionShow] = useState();
  const [otherPrintOptionShowData, setOtherPrintOptionShowData] = useState();
  const [svgIconData, setSvgIconData] = useState();
  const [summaryViewData, setSummuaryViewData] = useState();
  const [chartViewData, setChartViewData] = useState();
  const [imageViewData, setImageViewData] = useState();
  const [printViewData, setPrintViewData] = useState();
  const [isMultiTab, setIsMultiTab] = useState();
  const [isRightBaseColum, setIsRightBaseColum] = useState();
  const [spliterReportSecondPanel, setSpliterReportSecondPanel] = useState();
  const [defaultShowAllData, setDefaultShowAllData] = useState();
  const [spliterReportMonthRestiction, setSpliterReportMonthRestiction] = useState();
  const [otherSpliterSideData1, setOtherSpliterSideData1] = useState();
  const [otherSpliterSideData2, setOtherSpliterSideData2] = useState();
  const [currencyMaster, setCurrencyMaster] = useState();
  const [printMasterData, setPrintMasterData] = useState();
  const [dateOptions, setDateOptions] = useState();
  const [largeDataTitle, setLargeDataTitle] = useState("");
  const [reportName, setReportName] = useState("");
  const [colorMaster, setColorMaster] = useState();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getClientIpAddress();
  }, []);

  useEffect(() => {
    const initializeAndFetchReport = async () => {
      if (!newToken) {
        setTokenMissing(true);
        return;
      }

      try {
        let parsedData;
        const storedJson = sessionStorage.getItem(newToken);
        if (storedJson) {
          parsedData = JSON.parse(storedJson);
          if (parsedData?.LUId) {
            parsedData.LUId = atob(parsedData.LUId);
          }
          sessionStorage.setItem("reportVarible", JSON.stringify(parsedData));
        } else {
          const tokenBody = {
            ReqData: `[{"ForEvt":"GetTokenVal","Token":"${newToken}"}]`,
          };

          const APIURL =
            window.location.hostname === "localhost" ||
            window.location.hostname === "dxreport.web" ||
            window.location.hostname === "nzen"
              ? "http://nzen/jo/api-lib/App/CentralCrossDomainToken"
              : "https://vw.optigoapps.com/linkedapp/App/CentralCrossDomainToken";

          const tokenResponse = await axios.post(APIURL, tokenBody);
          const tokenData = tokenResponse?.data?.Data?.DT?.[0];

          const returnedToken = tokenData?.Token;
          const jsonDataString = tokenData?.JsonData;

          if (!jsonDataString || !returnedToken) {
            setTokenMissing(true);
            return;
          }

          parsedData = JSON.parse(jsonDataString);
          if (parsedData?.LUId) {
            parsedData.LUId = atob(parsedData.LUId);
          }

          sessionStorage.setItem(newToken, JSON.stringify(parsedData));
          sessionStorage.setItem("reportVarible", JSON.stringify(parsedData));
        }

        const AllData = parsedData;
        const clientIpAddress = sessionStorage.getItem("clientIpAddress");

        const body = {
          con: JSON.stringify({
            id: "",
            mode: "getPageId",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({ PageId: pid }),
          f: "DynamicReport (get column data)",
        };

        const response = await CallApi(body);
        // const response = sampleData;

        if (response?.Status === "400") {
          setTokenMissing(true);
          return;
        }

        const data = response?.rd?.[0];
        setColorMaster(response?.rd2);
        setCurrencyMaster(response?.rd3);
        setOtherPrintOptionShowData(response?.rd5)

        const masterName = response?.rd?.[0]?.PrintMasterName;
        const matched = response?.rd4?.find(
          (item) => item.PrintMaster === masterName
        );

        setPrintMasterData(matched);
        if (data?.stat === 1) {
          setReportId(data.ReportId);
          setSpNumber(data.SpNumber);
          setLargeDataTitle(data.MasterDataList || "");
          setLargeData(!!data.IsLargeDataReport);
          setSpliterReportShow(data.IsSpliterReport);
          setLargeDataShow(data.ServerSideDateWiseFilter);
          setSpliterReportFirstPanel(data.SpliterFirstPanel);
          setSpliterReportSecondPanel(data.SpliterSecondPanel);
          setIsFormulaBasedSummary(data.IsFormulaBasedSummary);
          setReportName(data.ReportName);
          setSpliterReportFirstPanelShowAll(data?.SpliterFirstPanelAll);
          setSpliterReportAllDataButton(data?.SpliterReportAllDataButton);
          setOtherPrintOptionShow(data?.otherPrintOptionShow);
          setSpliterReportSecondPanelShowAll(data?.SpliterSecondPanelAll);
          setSvgIconData(JSON.parse(data.SvgIconFilter));  // New.............
          setSpliterReportFirstPanelFilter(data?.SpliterFirstPanelFilter);  // New.............
          setSpliterReportSecondPanelSecondoption(data?.SpliterSecondPanelSecondData);  // New.............
          setDefaultShowAllData(data?.deafultShowAllData);
          setOtherSpliterSideData1(JSON?.parse(data.otherSpliterSideData1));
          setOtherSpliterSideData2(JSON.parse(data.otherSpliterSideData2));
          setImageViewData(JSON.parse(data.ImageDataArray));
          setPrintViewData(JSON.parse(data.PrintDataArray));
          setSummuaryViewData(JSON.parse(data.SummaryFormulaArray));
          setChartViewData(JSON.parse(data.chartViewData));
          setIsMultiTab(data?.IsMultiTab);
          setSpliterReportMonthRestiction(data.DateMonthRestriction);
          setIsRightBaseColum(data?.solitairegemstoneupdateaccess);
          setDateOptions(response?.rd1);
          const key = `${pid}_${data.ReportId}`;
          sessionStorage.setItem(key, data.ReportId);
        }

        setReady(true);
      } catch (err) {
        console.error("Error:", err);
        setTokenMissing(true);
      }
    };

    initializeAndFetchReport();
  }, [pid, CN, newToken]);

  if (pid === "18340") {
    return (
      <Suspense
        fallback={
          <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress />
          </div>
        }
      >
        <ReportListPage />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      }
    >
      <GridMain
        tokenMissing={tokenMissing}
        ready={ready}
        reportId={reportId}
        spNumber={spNumber}
        largeData={largeData}
        largeDataTitle={largeDataTitle}
        dateOptions={dateOptions}
        dateOptionsShow={dateOptionsShow}
        reportName={reportName}
        spliterReportShow={spliterReportShow}
        spliterReportFirstPanel={spliterReportFirstPanel}
        spliterReportSecondPanel={spliterReportSecondPanel}
        spliterReportMonthRestiction={spliterReportMonthRestiction}
        otherSpliterSideData1={otherSpliterSideData1}
        otherSpliterSideData2={otherSpliterSideData2}
        colorMaster={colorMaster}
        currencyMaster={currencyMaster}
        spliterReportFirstPanelShowAll={spliterReportFirstPanelShowAll}
        spliterReportSecondPanelShowAll={spliterReportSecondPanelShowAll}
        chartViewData={chartViewData}
        spliterReportAllDataButton={spliterReportAllDataButton}
        imageViewData={imageViewData}
        defaultShowAllData={defaultShowAllData}
        printViewData={printViewData}
        isMultiTab={isMultiTab}
        isRightBaseColum={isRightBaseColum}
        printMasterData={printMasterData}
        isFormulaBasedSummary={isFormulaBasedSummary}
        summaryViewData={summaryViewData}
        spliterReportFirstPanelFilter={spliterReportFirstPanelFilter}
        spliterReportSecondPanelSecondoption={spliterReportSecondPanelSecondoption}
        svgIconData={svgIconData}
        otherPrintOptionShow={otherPrintOptionShow}
        otherPrintOptionShowData={otherPrintOptionShowData}
      />
    </Suspense>
  );
}