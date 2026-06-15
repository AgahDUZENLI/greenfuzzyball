import { fonts, colors, spacing } from '../styles/tokens'

const styles = {
  h1: {
    fontSize: fonts.size['5xl'],
    fontWeight: fonts.weight.extrabold,
    lineHeight: fonts.lineHeight.tight,
    color: colors.black
  },
  h2: {
    fontSize: fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    lineHeight: fonts.lineHeight.tight,
    color: colors.black
  },
  h3: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.semibold,
    lineHeight: fonts.lineHeight.tight,
    color: colors.black
  },
  h4: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    lineHeight: fonts.lineHeight.normal,
    color: colors.black
  },
  body: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.regular,
    lineHeight: fonts.lineHeight.normal,
    color: colors.black
  },
  bodySmall: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.regular,
    lineHeight: fonts.lineHeight.normal,
    color: colors.gray[500]
  },
  caption: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.regular,
    lineHeight: fonts.lineHeight.normal,
    color: colors.gray[400]
  },
  label: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    lineHeight: fonts.lineHeight.normal,
    color: colors.gray[700],
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
  }
}

function Typography({ variant = 'body', children, color, mb, style = {} }) {
  const base = styles[variant] || styles.body

  const tags = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    bodySmall: 'p',
    caption: 'span',
    label: 'span'
  }

  const Tag = tags[variant] || 'p'

  return (
    <Tag style={{
      ...base,
      ...(color && { color }),
      ...(mb && { marginBottom: mb }),
      ...style
    }}>
      {children}
    </Tag>
  )
}

export default Typography