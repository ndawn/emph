<template lang="pug">
    .friend-card
        img.friend-card__photo(:src="friend.photo_100")
        .friend-card__text-container
            h4.friend-card__name {{ friendName }}
            p.frient-card__city {{ friendCity }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Friend } from '@/types';


@Component
export default class FriendCard extends Vue {
    @Prop() private friend!: Friend;

    get friendName (): string {
        return this.friend.first_name + ' ' + this.friend.last_name;
    }

    get friendCity (): string {
        return this.friend.city?.title || '';
    }
}
</script>

<style lang="scss" scoped>
.friend-card {
    display: flex;
    margin: 32px 0;
    width: 100%;
    align-items: center;
    border-radius: 5px;
    box-shadow: 0 4px 4px rgba(34, 34, 34, 0.05);
    background: white;

    &__photo {
        margin: 16px 24px;
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 50px;
    }

    &__text-container {
        display: inline-block;
        vertical-align: middle;
    }

    &__city {
        margin-top: 0;
    }
}
</style>
