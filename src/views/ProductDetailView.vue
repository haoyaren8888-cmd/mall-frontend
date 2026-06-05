<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatLineRound, DocumentCopy, Star, StarFilled } from '@element-plus/icons-vue'
import {
  cancelFavoriteProduct,
  createProductMessage,
  favoriteProduct,
  getFavoriteStatus,
  getProductDetail,
  getProductMessages,
  getProductReviews
} from '@/api/product'
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const product = ref(null)
const loading = ref(false)
const favoriteLoading = ref(false)
const favorited = ref(false)
const messageLoading = ref(false)
const messageSubmitting = ref(false)
const messages = ref([])
const messageTotal = ref(0)
const messagePage = ref(1)
const messageSize = 5
const messageContent = ref('')
const reviewLoading = ref(false)
const reviews = ref([])
const reviewTotal = ref(0)
const reviewPage = ref(1)
const reviewSize = 5

const isOwnProduct = computed(() => {
  const sellerId = product.value?.sellerId
  const userId = userStore.user?.id
  return sellerId !== undefined && sellerId !== null && userId !== undefined && Number(sellerId) === Number(userId)
})
const canContact = computed(() =>
  product.value?.status === 'ON' && product.value?.itemStatus === 'ON_SALE' && !isOwnProduct.value
)
const favoriteIcon = computed(() => (favorited.value ? StarFilled : Star))

const formatPrice = value => {
  const price = Number(value)
  return Number.isFinite(price) ? price.toFixed(2) : '0.00'
}

const formatTime = value => {
  if (!value) {
    return ''
  }
  return String(value).replace('T', ' ').slice(0, 16)
}

const saveIntent = async goCart => {
  if (isOwnProduct.value) {
    ElMessage.warning('不能购买自己发布的闲置商品')
    return
  }
  if (!canContact.value) {
    ElMessage.warning('这件闲置暂时不能交易')
    return
  }
  await cartStore.add(product.value, 1)
  ElMessage.success('已加入意向清单')
  if (goCart) {
    router.push('/cart')
  }
}

const copyTradePlace = async () => {
  const place = product.value?.tradePlace
  if (!place) {
    ElMessage.warning('暂未填写面交地点')
    return
  }
  try {
    await navigator.clipboard.writeText(place)
    ElMessage.success('已复制面交地点')
  } catch {
    ElMessage.warning('复制失败，请手动选择地点')
  }
}

const loadFavoriteStatus = async id => {
  if (!userStore.isLogin) {
    favorited.value = false
    return
  }
  try {
    const result = await getFavoriteStatus(id)
    favorited.value = typeof result === 'boolean' ? result : Boolean(result?.favorited)
  } catch {
    favorited.value = false
  }
}

const toggleFavorite = async () => {
  if (!product.value || favoriteLoading.value) {
    return
  }
  if (!userStore.isLogin) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  favoriteLoading.value = true
  try {
    if (favorited.value) {
      await cancelFavoriteProduct(product.value.id)
      favorited.value = false
      product.value.favoriteCount = Math.max(Number(product.value.favoriteCount || 0) - 1, 0)
      ElMessage.success('已取消收藏')
    } else {
      await favoriteProduct(product.value.id)
      favorited.value = true
      product.value.favoriteCount = Number(product.value.favoriteCount || 0) + 1
      ElMessage.success('已收藏')
    }
  } finally {
    favoriteLoading.value = false
  }
}

const loadMessages = async id => {
  if (!id) {
    messages.value = []
    messageTotal.value = 0
    return
  }
  messageLoading.value = true
  try {
    const result = await getProductMessages(id, {
      page: messagePage.value,
      size: messageSize
    })
    messages.value = result?.records || []
    messageTotal.value = Number(result?.total || 0)
  } catch {
    messages.value = []
    messageTotal.value = 0
  } finally {
    messageLoading.value = false
  }
}

const loadReviews = async id => {
  if (!id) {
    reviews.value = []
    reviewTotal.value = 0
    return
  }
  reviewLoading.value = true
  try {
    const result = await getProductReviews(id, {
      page: reviewPage.value,
      size: reviewSize
    })
    reviews.value = result?.records || []
    reviewTotal.value = Number(result?.total || 0)
  } catch {
    reviews.value = []
    reviewTotal.value = 0
  } finally {
    reviewLoading.value = false
  }
}

const submitMessage = async () => {
  if (!product.value || messageSubmitting.value) {
    return
  }
  if (!userStore.isLogin) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  const content = messageContent.value.trim()
  if (!content) {
    ElMessage.warning('请先输入咨询内容')
    return
  }

  messageSubmitting.value = true
  try {
    await createProductMessage(product.value.id, { content })
    ElMessage.success('留言已发布')
    messageContent.value = ''
    messagePage.value = 1
    await loadMessages(product.value.id)
  } finally {
    messageSubmitting.value = false
  }
}

const load = async id => {
  loading.value = true
  product.value = null
  favorited.value = false
  messages.value = []
  messageTotal.value = 0
  messagePage.value = 1
  reviews.value = []
  reviewTotal.value = 0
  reviewPage.value = 1
  try {
    product.value = await getProductDetail(id)
    await loadFavoriteStatus(id)
    await loadMessages(id)
    await loadReviews(id)
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <div class="page" v-loading="loading">
    <section v-if="product" class="detail-panel panel">
      <img :src="product.coverImage" :alt="product.name" />
      <div class="detail-info">
        <div class="tags">
          <el-tag type="success">{{ product.campus || '校内' }}</el-tag>
          <el-tag>{{ product.conditionLevel || '成色未填' }}</el-tag>
          <el-tag v-if="product.auditStatus === 'APPROVED'" type="info">已审核</el-tag>
          <el-tag v-if="isOwnProduct" type="warning">我发布的商品</el-tag>
        </div>
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
        <div class="price big">¥{{ formatPrice(product.price) }}</div>
        <div v-if="product.originalPrice" class="original">原价 ¥{{ formatPrice(product.originalPrice) }}</div>
        <dl class="trade-info">
          <div>
            <dt>交易方式</dt>
            <dd>{{ product.tradeType || '线下面交' }}</dd>
          </div>
          <div>
            <dt>面交地点</dt>
            <dd>{{ product.tradePlace || '双方协商' }}</dd>
          </div>
          <div>
            <dt>浏览</dt>
            <dd>{{ product.viewCount || 0 }} 次</dd>
          </div>
          <div>
            <dt>收藏</dt>
            <dd>{{ product.favoriteCount || 0 }} 人</dd>
          </div>
        </dl>
        <div class="notice">
          {{ isOwnProduct
            ? '这是你自己发布的闲置商品，可以在“我的发布”里编辑信息或下架。'
            : '校园闲置交易建议在校内公共区域当面验货，确认成色和配件后再付款。' }}
        </div>
        <div class="actions">
          <el-button :icon="favoriteIcon" :loading="favoriteLoading" @click="toggleFavorite">
            {{ favorited ? '取消收藏' : '收藏闲置' }}
          </el-button>
          <el-button :icon="DocumentCopy" @click="copyTradePlace">复制面交地点</el-button>
          <el-button :icon="Star" :disabled="!canContact" @click="saveIntent(false)">加入意向清单</el-button>
          <el-button type="primary" :icon="ChatLineRound" :disabled="!canContact" @click="saveIntent(true)">
            去意向清单
          </el-button>
        </div>
      </div>
    </section>
    <section v-if="product" class="message-panel panel">
      <div class="message-header">
        <div>
          <h2 class="section-title">留言咨询</h2>
          <p class="muted">可以先问清楚成色、配件和面交时间，再决定是否加入意向清单。</p>
        </div>
        <el-button text type="primary" @click="loadMessages(product.id)">刷新留言</el-button>
      </div>

      <div class="message-editor">
        <el-input
          v-model="messageContent"
          type="textarea"
          :rows="3"
          maxlength="300"
          show-word-limit
          placeholder="例如：可以今晚在图书馆门口看一下吗？配件是否齐全？"
        />
        <div class="message-editor-actions">
          <span>{{ userStore.isLogin ? '以当前登录用户身份发布' : '登录后可以发布咨询' }}</span>
          <el-button type="primary" :loading="messageSubmitting" @click="submitMessage">
            发布咨询
          </el-button>
        </div>
      </div>

      <div v-loading="messageLoading" class="message-list">
        <article v-for="message in messages" :key="message.id" class="message-item">
          <div class="avatar">{{ (message.nickname || '同').slice(0, 1) }}</div>
          <div class="message-body">
            <div class="message-meta">
              <strong>{{ message.nickname || '同学' }}</strong>
              <span>{{ message.campus || '校内' }} · {{ formatTime(message.createdAt) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
        </article>
        <el-empty v-if="!messageLoading && !messages.length" description="还没有同学留言咨询" />
      </div>

      <el-pagination
        v-if="messageTotal > messageSize"
        class="message-pagination"
        background
        layout="prev, pager, next"
        :total="messageTotal"
        :page-size="messageSize"
        v-model:current-page="messagePage"
        @current-change="loadMessages(product.id)"
      />
    </section>
    <section v-if="product" class="review-panel panel">
      <div class="message-header">
        <div>
          <h2 class="section-title">成交评价</h2>
          <p class="muted">交易完成后的买家反馈会展示在这里，方便判断成色和交付体验。</p>
        </div>
        <el-button text type="primary" @click="loadReviews(product.id)">刷新评价</el-button>
      </div>

      <div v-loading="reviewLoading" class="review-list">
        <article v-for="review in reviews" :key="review.id" class="review-item">
          <div class="avatar review-avatar">{{ (review.nickname || '同').slice(0, 1) }}</div>
          <div class="review-main">
            <div class="review-meta">
              <div>
                <strong>{{ review.nickname || '同学' }}</strong>
                <span>{{ review.campus || '校内' }} · {{ formatTime(review.createdAt) }}</span>
              </div>
              <el-rate :model-value="Number(review.rating || 0)" disabled />
            </div>
            <div class="review-content">{{ review.content }}</div>
          </div>
        </article>
        <el-empty v-if="!reviewLoading && !reviews.length" description="暂无成交评价" />
      </div>

      <el-pagination
        v-if="reviewTotal > reviewSize"
        class="message-pagination"
        background
        layout="prev, pager, next"
        :total="reviewTotal"
        :page-size="reviewSize"
        v-model:current-page="reviewPage"
        @current-change="loadReviews(product.id)"
      />
    </section>
    <el-empty v-else-if="!loading" description="闲置不存在或暂未通过审核" />
  </div>
</template>

<style scoped>
.detail-panel {
  display: grid;
  grid-template-columns: 48% 1fr;
  overflow: hidden;
}

img {
  width: 100%;
  height: 520px;
  object-fit: cover;
  display: block;
}

.detail-info {
  padding: 42px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.tags,
.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

h1 {
  margin: 0;
  font-size: 30px;
  letter-spacing: 0;
}

p {
  margin: 0;
  color: #4b5563;
  line-height: 1.8;
}

.big {
  font-size: 30px;
}

.original {
  width: fit-content;
  color: #9ca3af;
  text-decoration: line-through;
}

.trade-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.trade-info div {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

dt {
  color: #64748b;
  font-size: 13px;
}

dd {
  margin: 6px 0 0;
  color: #111827;
  font-weight: 700;
}

.notice {
  padding: 12px 14px;
  color: #475569;
  line-height: 1.6;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.message-panel,
.review-panel {
  margin-top: 20px;
  padding: 24px;
}

.message-header,
.message-editor-actions,
.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.message-header p {
  margin: 4px 0 0;
}

.message-editor {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.message-editor-actions {
  margin-top: 12px;
  color: #64748b;
  font-size: 13px;
}

.message-list {
  min-height: 120px;
  margin-top: 18px;
}

.message-item {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #edf2f7;
}

.message-item:last-child {
  border-bottom: 0;
}

.avatar {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #166534;
  font-weight: 800;
  background: #dcfce7;
}

.message-body {
  min-width: 0;
}

.message-meta strong {
  color: #111827;
}

.message-meta span {
  color: #64748b;
  font-size: 13px;
}

.message-content {
  margin-top: 8px;
  color: #374151;
  line-height: 1.7;
  word-break: break-word;
}

.message-pagination {
  margin-top: 12px;
  justify-content: flex-end;
}

.review-list {
  min-height: 120px;
  margin-top: 18px;
}

.review-item {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #edf2f7;
}

.review-item:last-child {
  border-bottom: 0;
}

.review-avatar {
  color: #7c2d12;
  background: #ffedd5;
}

.review-main {
  min-width: 0;
}

.review-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.review-meta strong {
  display: block;
  color: #111827;
}

.review-meta span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.review-content {
  margin-top: 10px;
  color: #374151;
  line-height: 1.7;
  word-break: break-word;
}

@media (max-width: 860px) {
  .detail-panel {
    grid-template-columns: 1fr;
  }

  img {
    height: 320px;
  }
}

@media (max-width: 560px) {
  .trade-info {
    grid-template-columns: 1fr;
  }

  .message-header,
  .message-editor-actions,
  .message-meta,
  .review-meta {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
