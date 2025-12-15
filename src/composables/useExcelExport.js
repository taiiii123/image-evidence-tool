import * as ExcelJS from 'exceljs'

export function useExcelExport() {
  const getImageExtension = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    const extMap = {
      'jpg': 'jpeg',
      'jpeg': 'jpeg',
      'png': 'png',
      'gif': 'gif',
      'bmp': 'bmp'
    }
    return extMap[ext] || 'png'
  }

  const exportToExcel = async (tabs, settings) => {
    const {
      imageWidth,
      imageHeight,
      rowSpacing,
      leftColumns,
      topRows,
      showImageNumbers
    } = settings

    const workbook = new ExcelJS.Workbook()

    // 各タブに対してワークシートを作成
    for (const tab of tabs) {
      const worksheet = workbook.addWorksheet(tab.name)
      const images = tab.images

      // 左余白列の幅設定
      for (let i = 0; i < leftColumns; i++) {
        worksheet.getColumn(i + 1).width = 8.38
      }

      // 画像列の幅設定
      worksheet.getColumn(leftColumns + 1).width = imageWidth / 7

      let currentRow = 1

      // 連番表示の場合、A1セルに「No」を追加
      if (showImageNumbers && leftColumns > 0) {
        const noCell = worksheet.getCell(1, leftColumns)
        noCell.value = 'No'
        noCell.alignment = {
          vertical: 'middle',
          horizontal: 'center'
        }
        noCell.font = {
          bold: true,
          size: 12
        }
        currentRow++
      }

      // 上余白
      for (let i = 0; i < topRows; i++) {
        worksheet.getRow(currentRow).height = 15
        currentRow++
      }

      // 画像とコメントの追加
      for (let i = 0; i < images.length; i++) {
        const image = images[i]

        // コメントがある場合
        if (image.comment) {
          const commentCell = worksheet.getCell(currentRow, leftColumns + 1)
          commentCell.value = image.comment
          commentCell.alignment = {
            vertical: 'top',
            horizontal: 'left',
            wrapText: true
          }
          commentCell.border = {
            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
          }
          currentRow++
        }

        // 連番表示
        if (showImageNumbers && leftColumns > 0) {
          const numberCell = worksheet.getCell(currentRow, leftColumns)
          numberCell.value = i + 1
          numberCell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          }
          numberCell.font = {
            bold: true,
            size: 12
          }
        }

        // 画像の追加
        const base64Data = image.dataUrl.split(',')[1]

        const imageId = workbook.addImage({
          base64: base64Data,
          extension: getImageExtension(image.name)
        })

        const requiredRows = Math.ceil(imageHeight / 20)

        // 行の高さ設定
        for (let r = 0; r < requiredRows; r++) {
          worksheet.getRow(currentRow + r).height = (imageHeight / requiredRows) * 0.75
        }

        // 画像の配置
        worksheet.addImage(imageId, {
          tl: { col: leftColumns, row: currentRow - 1 },
          br: { col: leftColumns + 1, row: currentRow - 1 + requiredRows }
        })

        currentRow += requiredRows

        // 行間
        for (let s = 0; s < rowSpacing; s++) {
          worksheet.getRow(currentRow).height = 15
          currentRow++
        }
      }
    }

    // ファイルの生成とダウンロード
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    link.download = 'エビデンス_' + timestamp + '.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return {
    exportToExcel
  }
}
