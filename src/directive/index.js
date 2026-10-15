import hasPermi from './permission/hasPermi'
import showtip from './tooltip/showtip'
import addFirstFilterClass from './addFirstClass/addFirstFilterClass'
import setBtnPrimary from './setBtnPrimary/setBtnPrimary'
import autoErrorPosition from './autoErrorPosition/autoErrorPosition'

export default function directive(app) {
  app.directive('hasPermi', hasPermi)
  app.directive('showtip', showtip)
  app.directive('addFirstFilterClass', addFirstFilterClass)
  app.directive('setBtnPrimary', setBtnPrimary)
  app.directive('autoErrorPosition', autoErrorPosition)
}
