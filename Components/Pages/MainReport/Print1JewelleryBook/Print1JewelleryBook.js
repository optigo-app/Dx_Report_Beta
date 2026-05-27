import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import "./Print1JewelleryBook.css";

export default function Print1JewelleryBook({
  visibleItemsMain,
  onPrintClick,
  preparingPrint,
  currentPrintPage,
  printViewData
}) {
  const img = "./images/noFound.jpg";
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const [withImage, setWithImage] = useState(true);
  const itemsPerPage = 1000;
  const [currentPage, setCurrentPage] = useState(1);
  const preloadedImages = useRef(new Set());
  const [hideShowFields, setHideShowFields] = useState({});
  const visibleItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return visibleItemsMain?.slice(startIdx, endIdx) || [];
  }, [visibleItemsMain, currentPage, itemsPerPage]);
  const itemsToPrint = useMemo(() => {
    if (preparingPrint) {
      const startIdx = (currentPrintPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      return visibleItemsMain?.slice(startIdx, endIdx) || [];
    }
    return visibleItems;
  }, [
    preparingPrint,
    currentPrintPage,
    visibleItemsMain,
    visibleItems,
    itemsPerPage,
  ]);

  // Preload images for next page in background

  useEffect(() => {
    if (Array.isArray(printViewData)) {
      const initialState = {};

      printViewData.forEach((item) => {
        if (item.IsHideShowOption) {
          initialState[item.value] = true;
        }
      });

      setHideShowFields(initialState);
    }
  }, [printViewData]);

  useEffect(() => {
    const preloadNextPageImages = () => {
      const nextPage = currentPage + 1;
      const totalPages = Math.ceil(
        (visibleItemsMain?.length || 0) / itemsPerPage
      );

      if (nextPage <= totalPages) {
        const startIdx = (nextPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const nextPageItems = visibleItemsMain?.slice(startIdx, endIdx) || [];

        nextPageItems.forEach((item) => {
          if (item?.ImgUrl && !preloadedImages.current.has(item.ImgUrl)) {
            const img = new Image();
            img.src = item.ImgUrl;
            preloadedImages.current.add(item.ImgUrl);
          }
        });
      }
    };

    // Preload after a short delay to not block current rendering
    const timer = setTimeout(preloadNextPageImages, 500);
    return () => clearTimeout(timer);
  }, [currentPage, visibleItemsMain, itemsPerPage]);

  const handleHideShowChange = (field) => {
    setHideShowFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPageNumbers = () => {
    const pages = [];
    const totalPageCount = totalPages;
    const maxVisible = 5;

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPageCount);
    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const totalPages = Math.ceil((visibleItemsMain?.length || 0) / itemsPerPage);

  const fixedValues = (value, zeroes) =>
    typeof value === "number"
      ? value?.toFixed(zeroes)
      : (+value)?.toFixed(zeroes);

  const handleImageError = (e) => {
    e.target.src = img;
  };

  const handleImageHideShow = useCallback(() => {
    setWithImage(!withImage);
  }, [withImage]);

  const handlePrintCurrentPage = () => {
    onPrintClick(visibleItems, currentPage);
  };

  const sortedPrintData = Array.isArray(printViewData)
    ? [...printViewData].sort(
      (a, b) => Number(a.displayorder || 0) - Number(b.displayorder || 0)
    )
    : [];

  const renderCard = (e, i, isPrint = false) => (
    <div key={i} className="col1 brbxAll spfntbH pagBrkIns">
      {e?.Customer ? (
        <div className="w-100 brBtom spaclftTpm spacBtom spfntHead">
          {e?.Customer}
        </div>
      ) : (
        <div className="minheit brBtom"></div>
      )}
      {withImage && e?.ImageName !== "" && (
        <div className="w-100 brBtom imgwdtheit">
          <img
            src={`${e?.ImgUrl}`}
            loading={isPrint ? "eager" : "lazy"}
            alt="Design_Image"
            onError={handleImageError}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "2px",
        }}
      >
        {sortedPrintData
          .filter((iteImage) => {
            if (!iteImage.IsHideShowOption) return true;
            return hideShowFields[iteImage.value];
          })
          .map((iteImage, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
              }}
            >
              {iteImage.lable &&
                <span
                  style={{
                    fontSize: `${iteImage.fontsizel}px` || "12px",
                    fontWeight: iteImage.fontweightl || 500,
                    color: "#555",
                  }}
                >
                  {iteImage.lable}
                </span>
              }

              <span
                style={{
                  fontSize: `${iteImage.fontsizev}px` || "12px",
                  fontWeight: iteImage.fontweightv || 500,
                  color: "#000",
                }}
              >
                {e?.[iteImage.value] || "-"}
              </span>
            </div>
          ))}
      </div>

      <div className="w-100 spaclftTpm d-flex" style={{ display: 'flex', justifyContent: 'space-between', marginInline: '5px' }}>
        <div className=" spfntBld spbrWord spfntHead">{e?.designno}</div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            lineHeight: "16px",
          }}
        >
          {e?.designcount !== undefined && (
            <span>
              Order: <strong>{e.designcount}</strong>
            </span>
          )}
          {e?.designcount !== undefined && e?.salescount !== undefined && ", "}
          {e?.salescount !== undefined && (
            <span>
              Sale: <strong>{e.salescount}</strong>
            </span>
          )}
        </p>
      </div>

      <div className="w-100 disflxCen spaclftTpm">
        <div className="wdth_45 spbrWord">{e?.Status}</div>
        {e?.Manufacturer ? <div className="spfntBld">|</div> : null}
        <div className="wdth_55 spacrighTpm spbrWord">{e?.Manufacturer}</div>
      </div>

      <div className="w-100 disflxCen spaclftTpm">
        {e?.Metal_Type && (
          <div className="wdth_45 spbrWord">{e?.Metal_Type}</div>
        )}
        {e?.Metal_Type ? <div> |</div> : null}
        <div
          className={`${e?.Metal_Type !== "" ? "wdth_55 spacrighTpm" : "w-100 spfntlft"
            } spbrWord`}
        >
          {e?.Sr_JobNo}
        </div>
      </div>

      <div className="w-100 disflxCen spaclftTpm">
        {e?.Metal_Color && (
          <div className="wdth_45 spbrWord">{e?.Metal_Color}</div>
        )}
        {e?.Metal_Color ? <div>|</div> : null}
        {e?.Gross_Wt && (
          <div
            className={`${e?.Metal_Color !== "" ? "wdth_55 spacrighTpm" : "w-100 spfntlft"
              } spbrWord`}
          >
            G.WT: {fixedValues(e?.Gross_Wt, 3)} gm
          </div>
        )}
      </div>

      {
        e?.Diam_Ctw || e?.CS_Ctw ? (
          <div className="w-100 disflxCen spaclftTpm">
            <div className="wdth_45 spbrWord">
              DIA: {e?.Diam_Ctw ? `${fixedValues(e?.Diam_Ctw, 3)}` : null}
            </div>

            {e?.CS_Ctw || e?.Misc_Ctw ? <div>|</div> : null}
            <div
              className={`${e?.Misc_Ctw !== "" ? "wdth_55 spacrighTpm" : "w-100 spfntlft"
                } spbrWord`}
            >
              N.WT: {fixedValues(e?.Metal_Wt, 3)} gm
            </div>
          </div>
        ) : null
      }

      <div className="w-100 disflxCen spaclftTpm">
        {e?.Misc_Ctw ? (
          <div className="w-100 disflx spaclftTpm spbrWord">
            MISC: {fixedValues(e?.Misc_Ctw, 3)}
          </div>
        ) : null}
        <div className="wdth_55 spacrighTpm spbrWord">
          {e?.CS_Ctw
            ? `CS: ${fixedValues(e?.CS_Ctw, 3)}`
            : e?.Misc_Ctw
              ? `MISC: ${fixedValues(e?.Misc_Ctw, 3)}`
              : null}
        </div>
      </div>

      {
        e?.Inwardno ? (
          <div className="w-100 disflx spaclftTpm spbrWord">
            Inward: {e?.Inwardno}
          </div>
        ) : null
      }

      {
        e?.Status === "Sold" && (
          <div className="w-100 spbrWord disflx spaclftTpm">
            Sale: {e?.InvoiceNo}
          </div>
        )
      }

      {
        e?.Status === "In Memo" && (
          <div className="w-100 disflx spbrWord spaclftTpm">
            Memo: {e?.InvoiceNo}
          </div>
        )
      }

      {
        e?.Status === "In Repair" && (
          <div className="w-100 disflx spaclftTpm spbrWord">
            Repair: {e?.InvoiceNo}
          </div>
        )
      }

      {
        e?.Status === "Purchase Return" && (
          <div className="w-100 disflx spaclftTpm spbrWord">
            Pur. Return: {e?.InvoiceNo}
          </div>
        )
      }
    </div >
  );

  return loader ? (
    <p>Loading...</p>
  ) : msg !== "" ? (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  ) : (
    <>
      <div className="screen-view no-print" style={{ width: "100%" }}>
        <div
          style={{
            position: "fixed",
            top: "70px",
            width: "100%",
            backgroundColor: "white",
            zIndex: 999,
            paddingBottom: "10px",
          }}
          className="hideData"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: "15px",
              paddingTop: "5px",
              width: '70%'
            }}
          >
            <label
              htmlFor="WithImage"
              className="inline-flex items-center cursor-pointer gap-2 fil_sec"
            >
              <input
                type="checkbox"
                checked={withImage}
                onChange={handleImageHideShow}
                name="WithImage"
                id="WithImage"
              />
              With Image
            </label>

            {/* Dynamic Hide/Show Fields */}
            {sortedPrintData
              ?.filter((x) => x.IsHideShowOption)
              ?.map((item, index) => (
                <label
                  key={index}
                  className="inline-flex items-center cursor-pointer gap-2 fil_sec"
                >
                  <input
                    type="checkbox"
                    checked={hideShowFields[item.value] ?? true}
                    onChange={() => handleHideShowChange(item.value)}
                  />
                  {item.lable || item.value}
                </label>
              ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {getPageNumbers().map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={num === currentPage ? "active" : ""}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <p
            className="hideData"
            style={{ textAlign: "center", margin: "5px 0" }}
          >
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </p>
        </div>

        {/* Display current page items */}
        <div
          style={{
            marginTop: "20px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div className="container disflx">
            {visibleItems.map((e, i) => renderCard(e, i, false))}
          </div>
        </div>
      </div>

      <div className="print-content print-only" style={{ display: "none" }}>
        <div className="container disflx">
          {itemsToPrint.map((e, i) => renderCard(e, i, true))}
        </div>
      </div>
    </>
  );
}
